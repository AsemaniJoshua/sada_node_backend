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
    getMemberByMemberId,
} from '../../controllers/admin/membershipAdminController.js';

const router = express.Router();

// Get membership by Unique Member ID (SADA-XXXXXX)
router.get('/member-id/:memberId', authenticate, authorize('admin'), getMemberByMemberId);

// Create new membership record (manual)
router.post('/', authenticate, authorize('admin'), createMembership);

// Get all membership records
router.get('/', authenticate, authorize('admin'), getAllMemberships);

// Get membership record by ID (UUID)
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
