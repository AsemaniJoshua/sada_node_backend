// Public membership routes
import express from 'express';
import { getAllMemberships, getMembershipById } from '../../controllers/public/membershipPublicController.js';

const router = express.Router();

// Get all membership records
router.get('/', getAllMemberships);

// Get membership record by ID
router.get('/:id', getMembershipById);

export default router;
