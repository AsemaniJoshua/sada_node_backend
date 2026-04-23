// Authentication controller - Handle auth logic
import { hash, verify } from 'argon2';
import { AppError } from '../../utils/error/AppError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt/jwt.js';
import { prisma } from '../../config/config.js';

/**
 * Register a new user
 * Any user can self-register
 */
const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            throw new AppError('Email, password, and name are required', 400, true);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('Invalid email format', 400, true);
        }

        // Validate password length
        if (password.length < 8) {
            throw new AppError('Password must be at least 8 characters long', 400, true);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new AppError('User with this email already exists', 409, true);
        }

        // Hash password using argon2
        const hashedPassword = await hash(password);

        // Create new user with default role "user"
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'user',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Return success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user and return JWT tokens
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            throw new AppError('Email and password are required', 400, true);
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError('Invalid email', 401, true);
        }

        // Verify password using argon2
        const isPasswordValid = await verify(user.password, password);

        if (!isPasswordValid) {
            throw new AppError('Invalid password', 401, true);
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Calculate refresh token expiry (14 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);

        // Store refresh token in database
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt,
            },
        });

        // Return success response with tokens
        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token using refresh token
 */
const refreshTokenController = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        // Validate input
        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400, true);
        }

        // Verify refresh token signature
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            throw new AppError('Invalid or expired refresh token', 401, true);
        }

        // Check if refresh token exists in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if (!storedToken) {
            throw new AppError('Refresh token not found or revoked', 401, true);
        }

        // Check if refresh token has expired
        if (new Date() > storedToken.expiresAt) {
            throw new AppError('Refresh token has expired', 401, true);
        }

        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            throw new AppError('User not found', 404, true);
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user.id, user.role);

        // Return success response with new access token
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully.',
            data: {
                accessToken: newAccessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user and revoke refresh token
 */
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        // Validate input
        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400, true);
        }

        // Delete refresh token from database
        await prisma.refreshToken.delete({
            where: { token: refreshToken },
        }).catch(() => {
            // Token might not exist, but logout should still succeed
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        next(error);
    }
};

export {
    register,
    login,
    refreshTokenController,
    logout,
};
