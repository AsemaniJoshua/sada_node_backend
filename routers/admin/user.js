// Admin User routes - Profile management
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import upload from '../../config/multer.js';
import { updateProfile } from '../../controllers/admin/userAdminController.js';

const router = express.Router();

/**
 * Update current admin profile
 * Uses PATCH for partial updates
 * Requires authentication and admin role
 */
router.patch('/profile', authenticate, authorize('admin'), upload.single('image'), updateProfile);

export default router;
