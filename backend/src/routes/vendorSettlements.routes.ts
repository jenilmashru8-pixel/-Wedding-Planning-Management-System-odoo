import { Router } from 'express';
import {
  getVendorInvoices,
  createVendorInvoice,
  recordVendorPayment,
  getVendorSettlementSummary,
} from '../controllers/vendorSettlements.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/invoices', getVendorInvoices);
router.post('/invoices', authorizeRoles('FOUNDER', 'FINANCE', 'PLANNER', 'VENDOR'), createVendorInvoice);
router.post('/payments', authorizeRoles('FOUNDER', 'FINANCE'), recordVendorPayment);
router.get('/summary/:weddingId', getVendorSettlementSummary);

export default router;
