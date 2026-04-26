// Public FAQs routes
import express from 'express';
import { getAllFAQs, getFAQById } from '../../controllers/public/faqController.js';

const router = express.Router();

// Get all FAQs
router.get('/', getAllFAQs);

// Get FAQ by ID
router.get('/:id', getFAQById);

export default router;
