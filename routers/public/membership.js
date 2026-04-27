// Public membership routes
import express from 'express';
import { registerMember, getAllMemberships, getMembershipById } from '../../controllers/public/membershipPublicController.js';

const router = express.Router();

// Register as member (public)
router.post('/', registerMember);

// Get all approved members
// router.get('/', getAllMemberships);

// Get approved member by ID
// router.get('/:id', getMembershipById);

export default router;
