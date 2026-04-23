// Auth routes - Register, login, refresh token, logout
import express from 'express';
import {
    register,
    login,
    refreshTokenController,
    logout,
} from '../../controllers/auth/authController.js';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Refresh access token
router.post('/refresh-token', refreshTokenController);

// Logout user
router.post('/logout', logout);

export default router;
