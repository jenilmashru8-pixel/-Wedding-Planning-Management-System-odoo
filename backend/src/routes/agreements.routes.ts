import { Router } from 'express';
import {
  getAgreements,
  getAgreementById,
  createAgreement,
  sendAgreement,
  signAgreement,
  downloadAgreementPdf,
} from '../controllers/agreements.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public signing and PDF download endpoints
router.post('/:id/sign', signAgreement);
router.get('/:id/pdf', downloadAgreementPdf);
router.get('/:id/public', getAgreementById);

// Protected endpoints
router.use(authenticateToken);
router.get('/', getAgreements);
router.get('/:id', getAgreementById);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER'), createAgreement);
router.post('/:id/send', authorizeRoles('FOUNDER', 'PLANNER'), sendAgreement);

export default router;
