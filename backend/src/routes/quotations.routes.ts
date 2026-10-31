import { Router } from 'express';
import {
  getQuotations,
  createQuotation,
  compareQuotations,
  selectQuotation,
} from '../controllers/quotations.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getQuotations);
router.get('/compare', compareQuotations);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER', 'VENDOR'), createQuotation);
router.post('/:id/select', authorizeRoles('FOUNDER', 'PLANNER', 'CLIENT'), selectQuotation);

export default router;
