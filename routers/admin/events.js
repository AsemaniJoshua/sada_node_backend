// Admin event routes with CRUD operations and image upload
import express from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEventById,
    deleteEventById,
} from '../../controllers/admin/eventAdminController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create new event
router.post('/', authenticate, authorize('admin'), upload.single('event_banner'), createEvent);

// Get all events
router.get('/', authenticate, authorize('admin'), getAllEvents);

// Get event by ID
router.get('/:id', authenticate, authorize('admin'), getEventById);

// Update event by ID
router.patch('/:id', authenticate, authorize('admin'), upload.single('event_banner'), updateEventById);

// Delete event by ID
router.delete('/:id', authenticate, authorize('admin'), deleteEventById);

export default router;
