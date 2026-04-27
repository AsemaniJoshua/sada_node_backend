// Admin membership routes with CRUD operations
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createMembership,
    getAllMemberships,
    getMembershipById,
    updateMembershipById,
    deleteMembershipById,
} from '../../controllers/admin/membershipAdminController.js';

const router = express.Router();

// Create new membership record
router.post('/', authenticate, authorize('admin'), createMembership);

// Get all membership records
router.get('/', authenticate, authorize('admin'), getAllMemberships);

// Get membership record by ID
router.get('/:id', authenticate, authorize('admin'), getMembershipById);

// Update membership record by ID
router.patch('/:id', authenticate, authorize('admin'), updateMembershipById);

// Delete membership record by ID
router.delete('/:id', authenticate, authorize('admin'), deleteMembershipById);

export default router;
