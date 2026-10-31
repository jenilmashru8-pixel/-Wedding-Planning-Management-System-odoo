import { Router } from 'express';
import {
  getMilestones,
  getPayments,
  recordClientPayment,
  getUpcomingPayments,
} from '../controllers/payments.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getPayments);
router.get('/milestones', getMilestones);
router.get('/upcoming', getUpcomingPayments);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER', 'FINANCE'), recordClientPayment);

export default router;
