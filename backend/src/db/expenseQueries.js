import { pool, query } from '../config/db.js';

/**
 * Inserts a new expense row.
 * Accepts an optional `db` parameter (defaults to `pool`) so it can be passed a
 * transaction client from `withTransaction()`.
 */
export const createExpense = async (
  { groupId, paidBy, description, amount, splitType },
  db = pool
) => {
  const result = await db.query(
    `INSERT INTO expenses (group_id, paid_by, description, amount, split_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [groupId, paidBy, description, amount, splitType]
  );
  return result.rows[0];
};

/**
 * Inserts participant rows for an expense.
 * Accepts an optional `db` parameter (defaults to `pool`) for transactions.
 */
export const createExpenseParticipants = async (
  expenseId,
  participants,
  db = pool
) => {
  if (!participants || participants.length === 0) {
    return [];
  }

  const values = [];
  const valuePlaceholders = [];
  let paramIndex = 1;

  for (const p of participants) {
    valuePlaceholders.push(
      `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`
    );
    values.push(
      expenseId,
      p.userId,
      p.rawValue !== undefined && p.rawValue !== null ? p.rawValue : null,
      p.shareAmount
    );
    paramIndex += 4;
  }

  const result = await db.query(
    `INSERT INTO expense_participants (expense_id, user_id, raw_value, share_amount)
     VALUES ${valuePlaceholders.join(', ')}
     RETURNING *`,
    values
  );
  return result.rows;
};

export const getExpensesForGroup = async (groupId) => {
  const result = await query(
    `SELECT e.id, e.group_id, e.paid_by, e.description, e.amount, e.split_type, e.created_at,
            payer.name AS paid_by_name
     FROM expenses e
     JOIN users payer ON payer.id = e.paid_by
     WHERE e.group_id = $1
     ORDER BY e.created_at DESC`,
    [groupId]
  );
  return result.rows;
};

export const getParticipantsForExpenses = async (expenseIds) => {
  if (!expenseIds || expenseIds.length === 0) return [];
  const result = await query(
    `SELECT ep.expense_id, ep.user_id, ep.raw_value, ep.share_amount,
            u.name, u.email
     FROM expense_participants ep
     JOIN users u ON u.id = ep.user_id
     WHERE ep.expense_id = ANY($1::int[])
     ORDER BY ep.user_id ASC`,
    [expenseIds]
  );
  return result.rows;
};

export const getMemberBalancesForGroup = async (groupId) => {
  const result = await query(
    `SELECT
       u.id AS user_id,
       u.name,
       u.email,
       COALESCE((
         SELECT SUM(e.amount) FROM expenses e
         WHERE e.group_id = $1 AND e.paid_by = u.id
       ), 0)::numeric(12,2) AS paid_total,
       COALESCE((
         SELECT SUM(ep.share_amount)
         FROM expense_participants ep
         JOIN expenses e ON e.id = ep.expense_id
         WHERE e.group_id = $1 AND ep.user_id = u.id
       ), 0)::numeric(12,2) AS share_total
     FROM users u
     JOIN group_members gm ON gm.user_id = u.id
     WHERE gm.group_id = $1
     ORDER BY u.id ASC`,
    [groupId]
  );
  return result.rows;
};
