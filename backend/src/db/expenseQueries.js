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
