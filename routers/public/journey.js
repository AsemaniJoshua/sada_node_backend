// Public Journey routes
import express from 'express';
import { getAllJourneys, getJourneyById } from '../../controllers/public/journeyController.js';

const router = express.Router();

// Get all journey milestones
router.get('/', getAllJourneys);

// Get journey milestone by ID
router.get('/:id', getJourneyById);

export default router;
