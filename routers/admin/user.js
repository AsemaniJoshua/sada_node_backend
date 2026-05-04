import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import upload from '../../config/multer.js';
import {
    updateProfile,
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    deleteUserById
} from '../../controllers/admin/userAdminController.js';

const router = express.Router();

/**
 * User Profile Management (Self)
 */
router.patch('/profile', authenticate, authorize('admin'), upload.single('image'), updateProfile);

/**
 * User Management (Admin CRUD)
 */
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.post('/', authenticate, authorize('admin'), upload.single('image'), createUser);
router.patch('/:id', authenticate, authorize('admin'), upload.single('image'), updateUserById);
router.delete('/:id', authenticate, authorize('admin'), deleteUserById);

export default router;
