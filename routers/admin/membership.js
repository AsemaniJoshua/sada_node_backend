// Admin membership routes with CRUD operations and approval/rejection
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createMembership,
    getAllMemberships,
    getMembershipById,
    updateMembershipById,
    deleteMembershipById,
    approveMembership,
    rejectMembership,
} from '../../controllers/admin/membershipAdminController.js';

const router = express.Router();

// Create new membership record (manual)
router.post('/', authenticate, authorize('admin'), createMembership);

// Get all membership records
router.get('/', authenticate, authorize('admin'), getAllMemberships);

// Get membership record by ID
router.get('/:id', authenticate, authorize('admin'), getMembershipById);

// Update membership record by ID
router.patch('/:id', authenticate, authorize('admin'), updateMembershipById);

// Approve membership
router.post('/:id/approve', authenticate, authorize('admin'), approveMembership);

// Reject membership
router.post('/:id/reject', authenticate, authorize('admin'), rejectMembership);

// Delete membership record by ID
router.delete('/:id', authenticate, authorize('admin'), deleteMembershipById);

export default router;
