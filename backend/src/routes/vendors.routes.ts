import { Router } from 'express';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  archiveVendor,
  getCategories,
} from '../controllers/vendors.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/categories', getCategories);
router.get('/', getVendors);
router.get('/:id', getVendorById);
router.post('/', authorizeRoles('FOUNDER', 'PLANNER'), createVendor);
router.put('/:id', authorizeRoles('FOUNDER', 'PLANNER'), updateVendor);
router.delete('/:id', authorizeRoles('FOUNDER'), archiveVendor);

export default router;
