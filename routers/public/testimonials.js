// Public testimonials routes
import express from 'express';
import { getAllTestimonials, getTestimonialById } from '../../controllers/public/testimonialController.js';

const router = express.Router();

// Get all testimonials
router.get('/', getAllTestimonials);

// Get testimonial by ID
router.get('/:id', getTestimonialById);

export default router;
