// Public membership routes
import express from 'express';
import { registerMember, getAllMemberships, getMembershipById, getMemberByMemberId } from '../../controllers/public/membershipPublicController.js';

const router = express.Router();

// Register as member (public)
router.post('/', registerMember);

// Get all approved members
router.get('/', getAllMemberships);

// Get member by Unique Member ID (SADA-XXXXXX)
router.get('/member-id/:memberId', getMemberByMemberId);

// Get approved member by ID (UUID)
router.get('/:id', getMembershipById);

export default router;
