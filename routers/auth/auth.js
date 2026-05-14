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
    completeFirstTimeLogin,
} from '../../controllers/auth/authController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';

const router = express.Router();

// Register new user
router.post('/register', authenticate, authorize('admin'), register);

// Login user
router.post('/login', login);

// Refresh access token
router.post('/refresh-token', refreshTokenController);

// Logout user
router.post('/logout', logout);

// Forgot password - Send OTP to email
router.post('/forgot-password', forgotPassword);

// Verify OTP - Validate OTP and get verification token
router.post('/verify-otp', verifyOtp);

// Reset password - Update password using verified OTP
router.post('/reset-password', resetPassword);

// Complete first-time login (set flag to false)
router.patch('/complete-first-time-login', authenticate, completeFirstTimeLogin);

export default router;
