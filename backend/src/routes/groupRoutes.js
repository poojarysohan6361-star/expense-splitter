import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { create, list, getDetails, addMember } from '../controllers/groupController.js';

const router = Router();

router.use(requireAuth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getDetails);
router.post('/:id/members', addMember);

export default router;
