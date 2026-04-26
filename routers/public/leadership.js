// Public Leadership routes
import express from 'express';
import { getAllLeadership, getLeadershipById } from '../../controllers/public/leadershipController.js';

const router = express.Router();

// Get all leadership profiles
router.get('/', getAllLeadership);

// Get leadership profile by ID
router.get('/:id', getLeadershipById);

export default router;
