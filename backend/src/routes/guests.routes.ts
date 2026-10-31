import { Router } from 'express';
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  checkInGuest,
  importGuests,
  exportGuestsCsv,
} from '../controllers/guests.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getGuests);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR', 'CLIENT'), createGuest);
router.put('/:id', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR', 'CLIENT'), updateGuest);
router.delete('/:id', authorizeRoles('FOUNDER', 'PLANNER'), deleteGuest);
router.patch('/:id/check-in', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), checkInGuest);
router.post('/import', authorizeRoles('FOUNDER', 'PLANNER', 'CLIENT'), importGuests);
router.get('/export/:weddingId', exportGuestsCsv);

export default router;
