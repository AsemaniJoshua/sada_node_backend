// Public Announcements routes
import express from 'express';
import { getAllAnnouncements, getAnnouncementById } from '../../controllers/public/announcementController.js';

const router = express.Router();

// Get all announcements
router.get('/', getAllAnnouncements);

// Get announcement by ID
router.get('/:id', getAnnouncementById);

export default router;
