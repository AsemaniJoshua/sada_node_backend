// Admin home routes with CRUD operations
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createHome,
    getAllHomes,
    getHomeById,
    updateHomeById,
    deleteHomeById,
} from '../../controllers/admin/homeAdminController.js';

const router = express.Router();

// Create new home record
router.post('/', authenticate, authorize('admin'), createHome);

// Get all home records
router.get('/', authenticate, authorize('admin'), getAllHomes);

// Get home record by ID
router.get('/:id', authenticate, authorize('admin'), getHomeById);

// Update home record by ID
router.patch('/:id', authenticate, authorize('admin'), updateHomeById);

// Delete home record by ID
router.delete('/:id', authenticate, authorize('admin'), deleteHomeById);

export default router;
