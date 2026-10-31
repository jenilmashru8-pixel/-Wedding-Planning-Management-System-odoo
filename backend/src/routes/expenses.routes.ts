import { Router } from 'express';
import {
  getExtraExpenses,
  createExtraExpense,
  updateExpenseApproval,
  generateClientInvoice,
  getClientInvoices,
} from '../controllers/expenses.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getExtraExpenses);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER', 'FIELD_COORDINATOR'), createExtraExpense);
router.patch('/:id/approval', authorizeRoles('FOUNDER', 'PLANNER', 'CLIENT'), updateExpenseApproval);

router.get('/invoices', getClientInvoices);
router.post('/invoices/generate', authorizeRoles('FOUNDER', 'FINANCE', 'PLANNER'), generateClientInvoice);

export default router;
