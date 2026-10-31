import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getSettings);
router.put('/', authorizeRoles('FOUNDER', 'ADMIN' as any), updateSettings);

export default router;
