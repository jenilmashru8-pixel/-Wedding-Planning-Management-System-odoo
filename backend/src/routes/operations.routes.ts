import { Router } from 'express';
import {
  getWeddingTimeline,
  createEvent,
  updateEvent,
  checkInVendor,
  getVendorCheckIns,
  getIncidents,
  reportIncident,
  resolveIncident,
} from '../controllers/operations.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/timeline', getWeddingTimeline);
router.get('/weddings/:weddingId/timeline', getWeddingTimeline);
router.post('/events', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), createEvent);
router.put('/events/:id', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), updateEvent);

router.post('/weddings/:weddingId/vendors/:vendorId/check-in', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), checkInVendor);
router.get('/check-ins', getVendorCheckIns);
router.get('/weddings/:weddingId/check-ins', getVendorCheckIns);

router.get('/incidents', getIncidents);
router.post('/incidents', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), reportIncident);
router.patch('/incidents/:id/resolve', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), resolveIncident);

export default router;
