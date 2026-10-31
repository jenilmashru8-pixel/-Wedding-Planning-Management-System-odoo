import { Router } from 'express';
import { getClients, getClientById, createClient, updateClient } from '../controllers/clients.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER', 'FINANCE'), createClient);
router.put('/:id', authorizeRoles('FOUNDER', 'PLANNER'), updateClient);

export default router;
