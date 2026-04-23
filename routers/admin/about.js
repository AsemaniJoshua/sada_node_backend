// Admin about routes with CRUD operations
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createAbout,
    getAllAbouts,
    getAboutById,
    updateAboutById,
    deleteAboutById,
} from '../../controllers/admin/aboutAdminController.js';

const router = express.Router();

// Create new about record
router.post('/', authenticate, authorize('admin'), createAbout);

// Get all about records
router.get('/', authenticate, authorize('admin'), getAllAbouts);

// Get about record by ID
router.get('/:id', authenticate, authorize('admin'), getAboutById);

// Update about record by ID
router.patch('/:id', authenticate, authorize('admin'), updateAboutById);

// Delete about record by ID
router.delete('/:id', authenticate, authorize('admin'), deleteAboutById);

export default router;
