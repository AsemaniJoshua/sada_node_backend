// Auth routes - Register, login, refresh token, logout
import express from 'express';
import {
    register,
    login,
    refreshTokenController,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    changePassword,
} from '../../controllers/auth/authController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';

const router = express.Router();

// Register  user
router.post('/register', authenticate, authorize('admin'), register);

// Login user
router.post('/login', login);
router.post('/refresh-token', refreshTokenController);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Protected Admin Routes
router.post('/logout', authenticate, logout);
router.patch('/change-password', authenticate, authorize('admin'), changePassword);

export default router;
