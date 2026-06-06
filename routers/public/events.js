import express from 'express';
import { getAllEvents, getEventById } from '../../controllers/public/eventController.js';

const router = express.Router();

// Get all upcoming and live events
router.get('/', getAllEvents);

// Get upcoming/live event by ID
router.get('/:id', getEventById);

export default router;
