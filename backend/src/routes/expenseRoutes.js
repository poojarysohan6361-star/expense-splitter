import { Router } from 'express';
import { createExpense } from '../controllers/expenseController.js';

const router = Router({ mergeParams: true });

router.post('/', createExpense);

export default router;
