// Admin Announcements routes with CRUD operations
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncementById,
    deleteAnnouncementById,
} from '../../controllers/admin/announcementAdminController.js';

const router = express.Router();

// Create new announcement
router.post('/', authenticate, authorize('admin'), createAnnouncement);

// Get all announcements
router.get('/', authenticate, authorize('admin'), getAllAnnouncements);

// Get announcement by ID
router.get('/:id', authenticate, authorize('admin'), getAnnouncementById);

// Update announcement by ID
router.patch('/:id', authenticate, authorize('admin'), updateAnnouncementById);

// Delete announcement by ID
router.delete('/:id', authenticate, authorize('admin'), deleteAnnouncementById);

export default router;
