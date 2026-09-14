import * as expenseService from '../services/expenseService.js';

/**
 * Returns parsed groupId as a positive integer, or null if invalid.
 * Mirrors the pattern in groupController.js to ensure non-numeric IDs
 * never cause raw PostgreSQL type cast errors.
 */
const parseGroupId = (rawId) => {
  if (!rawId || !/^\d+$/.test(rawId)) return null;
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const createExpense = async (req, res) => {
  const groupId = parseGroupId(req.params.groupId);
  if (groupId === null) {
    return res.status(400).json({ error: 'Invalid group id — must be a positive integer' });
  }

  try {
    const { description, amount, paidBy, splitType, participants } = req.body;
    const result = await expenseService.createExpense({
      groupId,
      requestingUserId: req.user.id,
      description,
      amount,
      paidBy,
      splitType,
      participants,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
