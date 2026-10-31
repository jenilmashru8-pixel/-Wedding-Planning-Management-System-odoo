import { Router } from 'express';
import {
  getWeddingTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  generateWeddingTasks,
} from '../controllers/tasks.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getWeddingTasks);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), createTask);
router.put('/:id', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), updateTask);
router.patch('/:id/status', updateTaskStatus);
router.post('/:weddingId/generate', authorizeRoles('FOUNDER', 'PLANNER'), generateWeddingTasks);

export default router;
