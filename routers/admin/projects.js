// Admin projects routes with CRUD operations and image upload
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import upload from '../../config/multer.js';
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProjectById,
    deleteProjectById,
} from '../../controllers/admin/projectAdminController.js';

const router = express.Router();

// Create new project with image upload (multiple images allowed)
router.post('/', authenticate, authorize('admin'), upload.array('images', 10), createProject);

// Get all projects
router.get('/', authenticate, authorize('admin'), getAllProjects);

// Get project by ID
router.get('/:id', authenticate, authorize('admin'), getProjectById);

// Update project by ID with optional image upload
router.patch('/:id', authenticate, authorize('admin'), upload.array('images', 10), updateProjectById);

// Delete project by ID
router.delete('/:id', authenticate, authorize('admin'), deleteProjectById);

export default router;
