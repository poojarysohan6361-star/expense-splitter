import { withTransaction } from '../config/db.js';
import * as groupQueries from '../db/groupQueries.js';
import * as expenseQueries from '../db/expenseQueries.js';
import { calculateSplits } from './expenseEngine.js';
import { toCents, fromCents } from '../utils/money.js';

const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

const forbidden = (message) => {
  const err = new Error(message);
  err.status = 403;
  return err;
};

const ALLOWED_SPLIT_TYPES = ['equal', 'exact', 'percentage', 'shares'];

/**
 * Computes balances and settlement transactions scoped strictly to this single expense.
 *
 * @param {Object} params
 * @param {number} params.paidBy - userId who paid the total amount
 * @param {number} params.amountCents - Total expense amount in cents
 * @param {Array<{ userId: number, shareAmountCents: number }>} params.participants
 * @returns {{ balances: Array<{ userId: number, netAmount: string }>, transactions: Array<{ from: number, to: number, amount: string }> }}
 */
export const calculateBalancesAndTransactions = ({ paidBy, amountCents, participants }) => {
  const userIds = new Set(participants.map((p) => p.userId));
  userIds.add(paidBy);

  const shareMap = new Map();
  for (const p of participants) {
    shareMap.set(p.userId, p.shareAmountCents);
  }

  const sortedUserIds = Array.from(userIds).sort((a, b) => a - b);

  const balances = sortedUserIds.map((userId) => {
    const paid = userId === paidBy ? amountCents : 0;
    const share = shareMap.get(userId) || 0;
    const netCents = paid - share;
    return {
      userId,
      netAmount: fromCents(netCents),
    };
  });

  // For this single expense, every participant (other than paidBy) owes their share directly to paidBy
  const transactions = [];
  const sortedParticipants = [...participants].sort((a, b) => a.userId - b.userId);
  for (const p of sortedParticipants) {
    if (p.userId !== paidBy && p.shareAmountCents > 0) {
      transactions.push({
        from: p.userId,
        to: paidBy,
        amount: fromCents(p.shareAmountCents),
      });
    }
  }

  return { balances, transactions };
};

const notFound = (message) => {
  const err = new Error(message);
  err.status = 404;
  return err;
};

const assertGroupMember = async (groupId, requestingUserId) => {
  const group = await groupQueries.findGroupById(groupId);
  if (!group) throw notFound('Group not found');
  const members = await groupQueries.getGroupMembers(groupId);
  const isRequesterMember = members.some((m) => m.id === requestingUserId);
  if (!isRequesterMember) {
    throw forbidden('You are not a member of this group');
  }
  return members;
};

export const listExpensesForGroup = async ({ groupId, requestingUserId }) => {
  await assertGroupMember(groupId, requestingUserId);

  const expenseRows = await expenseQueries.getExpensesForGroup(groupId);
  const ids = expenseRows.map((e) => e.id);
  const participantRows = await expenseQueries.getParticipantsForExpenses(ids);
  const byExpense = new Map();
  for (const p of participantRows) {
    if (!byExpense.has(p.expense_id)) byExpense.set(p.expense_id, []);
    byExpense.get(p.expense_id).push({
      userId: p.user_id,
      name: p.name,
      email: p.email,
      rawValue: p.raw_value === null ? null : Number(p.raw_value),
      shareAmount: p.share_amount,
    });
  }

  return expenseRows.map((e) => ({
    id: e.id,
    groupId: e.group_id,
    paidBy: e.paid_by,
    paidByName: e.paid_by_name,
    description: e.description,
    amount: e.amount,
    splitType: e.split_type,
    createdAt: e.created_at,
    participants: byExpense.get(e.id) || [],
  }));
};

export const getGroupBalances = async ({ groupId, requestingUserId }) => {
  await assertGroupMember(groupId, requestingUserId);

  const rows = await expenseQueries.getMemberBalancesForGroup(groupId);
  const memberBalances = rows.map((row) => {
    const paid = toCents(row.paid_total);
    const share = toCents(row.share_total);
    const netCents = paid - share;
    return {
      userId: row.user_id,
      name: row.name,
      email: row.email,
      paidTotal: fromCents(paid),
      shareTotal: fromCents(share),
      netAmount: fromCents(netCents),
    };
  });

  const current = memberBalances.find((m) => m.userId === requestingUserId);
  const netCents = current ? toCents(current.netAmount) : 0;
  const youOwe = netCents < 0 ? fromCents(-netCents) : fromCents(0);
  const owedToYou = netCents > 0 ? fromCents(netCents) : fromCents(0);
  const groupExpensesCents = rows.reduce((sum, row) => sum + toCents(row.paid_total), 0);

  return {
    members: memberBalances,
    youOwe,
    owedToYou,
    netAmount: current ? current.netAmount : fromCents(0),
    groupExpenses: fromCents(groupExpensesCents),
  };
};

/**
 * Validates, computes, and persists a new expense and its participants.
 */
export const createExpense = async ({
  groupId,
  requestingUserId,
  description,
  amount,
  paidBy,
  splitType,
  participants,
}) => {
  // 1. Check group membership of the requester
  const members = await groupQueries.getGroupMembers(groupId);
  const isRequesterMember = members.some((m) => m.id === requestingUserId);
  if (!isRequesterMember) {
    throw forbidden('You are not a member of this group');
  }

  const memberIdSet = new Set(members.map((m) => m.id));

  // 2. Validate description
  if (typeof description !== 'string' || description.trim().length === 0) {
    throw badRequest('description is required and must not be empty');
  }
  const trimmedDescription = description.trim();
  if (trimmedDescription.length > 255) {
    throw badRequest('description must not exceed 255 characters');
  }

  // 3. Validate amount
  if (amount === undefined || amount === null || amount === '') {
    throw badRequest('amount is required');
  }
  let amountCents;
  try {
    amountCents = toCents(amount);
  } catch (err) {
    throw badRequest(err.message);
  }
  if (amountCents <= 0) {
    throw badRequest('amount must be greater than 0');
  }

  // 4. Validate paidBy
  if (paidBy === undefined || paidBy === null || !Number.isInteger(Number(paidBy)) || Number(paidBy) <= 0) {
    throw badRequest('paidBy is required and must be a positive integer userId');
  }
  const paidByUserId = Number(paidBy);
  if (!memberIdSet.has(paidByUserId)) {
    throw badRequest(`paidBy user (${paidByUserId}) is not a member of this group`);
  }

  // 5. Validate splitType
  if (!splitType || !ALLOWED_SPLIT_TYPES.includes(splitType)) {
    throw badRequest(
      `splitType is required and must be one of: ${ALLOWED_SPLIT_TYPES.join(', ')}`
    );
  }

  // 6. Validate participants array
  if (!Array.isArray(participants) || participants.length === 0) {
    throw badRequest('participants must be an array with at least one participant');
  }

  const seenUserIds = new Set();
  const normalizedParticipants = [];

  for (const p of participants) {
    if (!p || typeof p !== 'object' || p.userId === undefined || !Number.isInteger(Number(p.userId)) || Number(p.userId) <= 0) {
      throw badRequest('Each participant must be an object with a positive integer userId');
    }
    const uid = Number(p.userId);
    if (seenUserIds.has(uid)) {
      throw badRequest(`Duplicate userId in participants: ${uid}`);
    }
    seenUserIds.add(uid);

    if (!memberIdSet.has(uid)) {
      throw badRequest(`Participant user ${uid} is not a member of this group`);
    }

    normalizedParticipants.push({
      userId: uid,
      rawValue: p.rawValue,
    });
  }

  // 7. Validate rawValues based on splitType
  if (splitType === 'exact') {
    let sumCents = 0;
    for (const p of normalizedParticipants) {
      if (p.rawValue === undefined || p.rawValue === null || p.rawValue === '') {
        throw badRequest(`Participant ${p.userId} requires rawValue for exact split`);
      }
      let cents;
      try {
        cents = toCents(p.rawValue);
      } catch (err) {
        throw badRequest(`Participant ${p.userId} rawValue is invalid: ${err.message}`);
      }
      if (cents <= 0) {
        throw badRequest(`Participant ${p.userId} exact amount must be greater than 0`);
      }
      p.rawValueCents = cents;
      sumCents += cents;
    }

    if (sumCents !== amountCents) {
      throw badRequest(
        `Exact split amounts sum to ${fromCents(sumCents)}, which does not match total amount ${fromCents(amountCents)}`
      );
    }
  } else if (splitType === 'percentage') {
    let percentageSum = 0;
    for (const p of normalizedParticipants) {
      if (p.rawValue === undefined || p.rawValue === null || p.rawValue === '') {
        throw badRequest(`Participant ${p.userId} requires rawValue for percentage split`);
      }
      const pct = Number(p.rawValue);
      if (Number.isNaN(pct) || pct <= 0 || pct > 100) {
        throw badRequest(`Participant ${p.userId} percentage must be between 0 and 100`);
      }
      percentageSum += pct;
    }

    if (Math.abs(percentageSum - 100) > 1e-6) {
      throw badRequest(`Percentage values must sum to exactly 100 (received ${percentageSum})`);
    }
  } else if (splitType === 'shares') {
    for (const p of normalizedParticipants) {
      if (p.rawValue === undefined || p.rawValue === null || p.rawValue === '') {
        throw badRequest(`Participant ${p.userId} requires rawValue for shares split`);
      }
      const weight = Number(p.rawValue);
      if (Number.isNaN(weight) || weight <= 0) {
        throw badRequest(`Participant ${p.userId} shares weight must be greater than 0`);
      }
    }
  }

  // 8. Run the pure split calculation engine
  const computedSplits = calculateSplits({
    amountCents,
    splitType,
    participants: normalizedParticipants,
  });

  // 9. Prepare DB participant records
  const dbParticipants = computedSplits.map((p) => ({
    userId: p.userId,
    rawValue: splitType === 'equal' ? null : p.rawValue,
    shareAmount: fromCents(p.shareAmountCents),
  }));

  // 10. Persist inside a single transaction
  const { expense } = await withTransaction(async (client) => {
    const expenseRow = await expenseQueries.createExpense(
      {
        groupId,
        paidBy: paidByUserId,
        description: trimmedDescription,
        amount: fromCents(amountCents),
        splitType,
      },
      client
    );

    await expenseQueries.createExpenseParticipants(
      expenseRow.id,
      dbParticipants,
      client
    );

    return { expense: expenseRow };
  });

  // 11. Compute balances and settlement transactions scoped to THIS expense only
  const { balances, transactions } = calculateBalancesAndTransactions({
    paidBy: paidByUserId,
    amountCents,
    participants: computedSplits,
  });

  // 12. Format response matching specification
  return {
    expense: {
      id: expense.id,
      groupId: expense.group_id,
      paidBy: expense.paid_by,
      description: expense.description,
      amount: fromCents(amountCents),
      splitType: expense.split_type,
      createdAt: expense.created_at,
    },
    participants: computedSplits.map((p) => ({
      userId: p.userId,
      rawValue: splitType === 'equal' || p.rawValue === undefined || p.rawValue === null ? null : Number(p.rawValue),
      shareAmount: fromCents(p.shareAmountCents),
    })),
    balances,
    transactions,
  };
};
