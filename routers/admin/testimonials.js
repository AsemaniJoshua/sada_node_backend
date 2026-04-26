// Admin testimonials routes with CRUD operations and image upload
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import upload from '../../config/multer.js';
import {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonialById,
    deleteTestimonialById,
} from '../../controllers/admin/testimonialAdminController.js';

const router = express.Router();

// Create new testimonial with image upload
router.post('/', authenticate, authorize('admin'), upload.single('image'), createTestimonial);

// Get all testimonials
router.get('/', authenticate, authorize('admin'), getAllTestimonials);

// Get testimonial by ID
router.get('/:id', authenticate, authorize('admin'), getTestimonialById);

// Update testimonial by ID with optional image upload
router.patch('/:id', authenticate, authorize('admin'), upload.single('image'), updateTestimonialById);

// Delete testimonial by ID
router.delete('/:id', authenticate, authorize('admin'), deleteTestimonialById);

export default router;
