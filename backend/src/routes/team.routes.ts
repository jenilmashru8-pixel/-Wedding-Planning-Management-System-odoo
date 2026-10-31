import { Router } from 'express';
import { getEmployees, createTimeLog, getTimeLogs } from '../controllers/team.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/employees', getEmployees);
router.get('/time-logs', getTimeLogs);
router.post('/time-logs', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), createTimeLog);

export default router;
