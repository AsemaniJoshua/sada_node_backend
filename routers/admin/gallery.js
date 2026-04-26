// Admin gallery routes with CRUD operations and image upload
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import upload from '../../config/multer.js';
import {
    createGallery,
    getAllGalleries,
    getGalleryById,
    updateGalleryById,
    deleteGalleryById,
    uploadGalleryImage,
} from '../../controllers/admin/galleryAdminController.js';

const router = express.Router();

// Upload multiple images as gallery entry
router.post('/upload', authenticate, authorize('admin'), upload.array('images', 10), uploadGalleryImage);

// Create new gallery entry with multiple image uploads
router.post('/', authenticate, authorize('admin'), upload.array('images', 10), createGallery);

// Get all gallery entries
router.get('/', authenticate, authorize('admin'), getAllGalleries);

// Get gallery entry by ID
router.get('/:id', authenticate, authorize('admin'), getGalleryById);

// Update gallery entry by ID with optional image uploads
router.patch('/:id', authenticate, authorize('admin'), upload.array('images', 10), updateGalleryById);

// Delete gallery entry by ID
router.delete('/:id', authenticate, authorize('admin'), deleteGalleryById);

export default router;
