// Public gallery routes
import express from 'express';
import { getAllGalleries, getGalleryById } from '../../controllers/public/galleryController.js';

const router = express.Router();

router.get('/', getAllGalleries);

router.get('/:id', getGalleryById);

export default router;
