// Admin FAQs routes with CRUD operations
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createFAQ,
    getAllFAQs,
    getFAQById,
    updateFAQById,
    deleteFAQById,
} from '../../controllers/admin/faqAdminController.js';

const router = express.Router();

// Create new FAQ
router.post('/', authenticate, authorize('admin'), createFAQ);

// Get all FAQs
router.get('/', authenticate, authorize('admin'), getAllFAQs);

// Get FAQ by ID
router.get('/:id', authenticate, authorize('admin'), getFAQById);

// Update FAQ by ID
router.patch('/:id', authenticate, authorize('admin'), updateFAQById);

// Delete FAQ by ID
router.delete('/:id', authenticate, authorize('admin'), deleteFAQById);

export default router;
