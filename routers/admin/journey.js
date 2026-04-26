// Admin Journey routes with CRUD operations
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createJourney,
    getAllJourneys,
    getJourneyById,
    updateJourneyById,
    deleteJourneyById,
} from '../../controllers/admin/journeyAdminController.js';

const router = express.Router();

// Create new journey milestone
router.post('/', authenticate, authorize('admin'), createJourney);

// Get all journey milestones
router.get('/', authenticate, authorize('admin'), getAllJourneys);

// Get journey milestone by ID
router.get('/:id', authenticate, authorize('admin'), getJourneyById);

// Update journey milestone by ID
router.patch('/:id', authenticate, authorize('admin'), updateJourneyById);

// Delete journey milestone by ID
router.delete('/:id', authenticate, authorize('admin'), deleteJourneyById);

export default router;
