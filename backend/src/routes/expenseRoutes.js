import { Router } from 'express';
import { createExpense, listExpenses } from '../controllers/expenseController.js';

const router = Router({ mergeParams: true });

router.get('/', listExpenses);
router.post('/', createExpense);

export default router;

const router = Router({ mergeParams: true });

router.post('/', createExpense);

export default router;
