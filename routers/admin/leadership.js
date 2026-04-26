// Admin Leadership routes with CRUD operations
import express from 'express';
import { upload } from '../../config/multer.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createLeadership,
    getAllLeadership,
    getLeadershipById,
    updateLeadershipById,
    deleteLeadershipById,
} from '../../controllers/admin/leadershipAdminController.js';

const router = express.Router();

// Create new leadership profile
router.post('/', authenticate, authorize('admin'), upload.single('image'), createLeadership);

// Get all leadership profiles
router.get('/', authenticate, authorize('admin'), getAllLeadership);

// Get leadership profile by ID
router.get('/:id', authenticate, authorize('admin'), getLeadershipById);

// Update leadership profile by ID
router.patch('/:id', authenticate, authorize('admin'), upload.single('image'), updateLeadershipById);

// Delete leadership profile by ID
router.delete('/:id', authenticate, authorize('admin'), deleteLeadershipById);

export default router;
