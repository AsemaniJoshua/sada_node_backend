// Public gallery routes
import express from 'express';
import { getAllGalleries, getGalleryById } from '../../controllers/public/galleryController.js';

const router = express.Router();

// Get all gallery entries
router.get('/', getAllGalleries);

// Get gallery entry by ID
router.get('/:id', getGalleryById);

export default router;
