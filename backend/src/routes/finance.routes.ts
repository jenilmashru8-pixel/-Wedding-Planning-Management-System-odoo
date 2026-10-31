import { Router } from 'express';
import { getFinanceDashboard, getWeddingProfitReport } from '../controllers/finance.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('FOUNDER', 'FINANCE', 'PLANNER'));

router.get('/dashboard', getFinanceDashboard);
router.get('/weddings/:weddingId/profit', getWeddingProfitReport);

export default router;
