import { Router } from 'express';
import {
  getWeddings,
  getWeddingById,
  getWeddingOverview,
  createWedding,
  updateWedding,
} from '../controllers/weddings.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getWeddings);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER'), createWedding);
router.get('/:id', getWeddingById);
router.get('/:id/overview', getWeddingOverview);
router.put('/:id', authorizeRoles('FOUNDER', 'PLANNER'), updateWedding);

export default router;
