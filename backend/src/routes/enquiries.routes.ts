import { Router } from 'express';
import {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  scheduleConsultation,
  convertEnquiryToWedding,
} from '../controllers/enquiries.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getEnquiries);
router.post('/', createEnquiry);
router.get('/:id', getEnquiryById);
router.put('/:id', updateEnquiry);
router.delete('/:id', authorizeRoles('FOUNDER'), deleteEnquiry);
router.post('/:id/consultation', scheduleConsultation);
router.post('/:id/convert', authorizeRoles('FOUNDER', 'PLANNER'), convertEnquiryToWedding);

export default router;
