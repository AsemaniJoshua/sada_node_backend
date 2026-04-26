// Admin contact routes - View form submissions
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import { getAllContacts, getContactById, deleteContactById } from '../../controllers/admin/contactAdminController.js';

const router = express.Router();

// Get all contact submissions
router.get('/', authenticate, authorize('admin'), getAllContacts);

// Get contact submission by ID
router.get('/:id', authenticate, authorize('admin'), getContactById);

// Delete contact submission by ID
router.delete('/:id', authenticate, authorize('admin'), deleteContactById);

export default router;
