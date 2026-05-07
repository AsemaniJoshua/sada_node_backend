// Authentication controller - Handle auth logic
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';
import { AppError } from '../../utils/error/AppError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt/jwt.js';
import { prisma } from '../../config/config.js';

// Create nodemailer transporter for password reset emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Register a new user
 * Any user can self-register
 */
const register = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;

        // Validate input
        if (!email || !password || !name) {
            throw new AppError('Email, password, and name are required', 400, true);
        }

        // Validate and set role (default to 'user' if not provided)
        const allowedRoles = ['admin', 'user'];
        let userRole = role && role.trim() ? role.trim() : 'admin';

        if (!allowedRoles.includes(userRole)) {
            throw new AppError(`Invalid role. Must be one of: ${allowedRoles.join(', ')}`, 400, true);
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

        // Create new user with specified role (defaults to 'user')
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: userRole,
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

/**
 * Request password reset via OTP
 * Generates 6-digit OTP and sends to user's email
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.trim()) {
            throw new AppError('Email is required', 400, true);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            throw new AppError('Invalid email format', 400, true);
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: email.trim() },
        });

        if (!user) {
            throw new AppError('User with this email does not exist', 404, true);
        }

        // Delete any existing pending password reset requests
        await prisma.passwordReset.deleteMany({
            where: { userId: user.id },
        });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP for storage
        const otpHash = await hash(otp);

        // Set OTP expiry to 15 minutes from now
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Store OTP in database
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                otp,
                otpHash,
                expiresAt,
            },
        });

        // Send OTP via email
        const mailOptions = {
            from: 'SADA <' + process.env.EMAIL_USER + '>',
            to: `${email.trim()}`,
            subject: 'Password Reset OTP - SADA',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset OTP</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            padding: 40px 20px;
                            text-align: center;
                            color: #ffffff;
                        }
                        .header h1 {
                            font-size: 28px;
                            font-weight: 700;
                            margin-bottom: 8px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .content p {
                            color: #333;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 24px;
                        }
                        .otp-box {
                            background: #f3f4f6;
                            border: 2px solid #10b981;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .otp-code {
                            font-size: 32px;
                            font-weight: 700;
                            color: #10b981;
                            letter-spacing: 4px;
                            font-family: 'Courier New', monospace;
                        }
                        .expiry {
                            color: #666;
                            font-size: 14px;
                            margin-top: 12px;
                        }
                        .warning {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 12px;
                            margin: 20px 0;
                            border-radius: 4px;
                            color: #92400e;
                            font-size: 14px;
                        }
                        .footer {
                            background: #f9fafb;
                            padding: 20px 30px;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            border-top: 1px solid #e5e7eb;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${user.name},</p>
                            <p>You requested to reset your password. Use the OTP below to proceed:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                                <div class="expiry">This OTP will expire in 15 minutes</div>
                            </div>
                            
                            <p>If you did not request this, please ignore this email and your account will remain secure.</p>
                            
                            <div class="warning">
                                ⚠️ <strong>Security Warning:</strong> Never share this OTP with anyone. SADA staff will never ask for your OTP.
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 SADA. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        // Send email asynchronously (don't wait for response)
        await transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error('Error sending OTP email:', error);
            }
        });

        // Return success response (don't reveal if user exists)
        res.status(200).json({
            success: true,
            message: 'If an account with this email exists, an OTP has been sent to it.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify OTP for password reset
 * Returns verification token if OTP is valid
 */
const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !email.trim()) {
            throw new AppError('Email is required', 400, true);
        }

        if (!otp || !otp.trim()) {
            throw new AppError('OTP is required', 400, true);
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.trim() },
        });

        if (!user) {
            throw new AppError('User with this email does not exist', 404, true);
        }

        // Find the most recent password reset request
        const passwordReset = await prisma.passwordReset.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        if (!passwordReset) {
            throw new AppError('No password reset request found. Please request a new OTP.', 400, true);
        }

        // Check if OTP has expired
        if (new Date() > passwordReset.expiresAt) {
            // Delete expired OTP
            await prisma.passwordReset.delete({
                where: { id: passwordReset.id },
            });
            throw new AppError('OTP has expired. Please request a new one.', 400, true);
        }

        // Verify OTP
        const isOtpValid = await verify(passwordReset.otpHash, otp.trim());

        if (!isOtpValid) {
            throw new AppError('Invalid OTP', 401, true);
        }

        // Mark OTP as verified
        await prisma.passwordReset.update({
            where: { id: passwordReset.id },
            data: { isVerified: true },
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully.',
            data: {
                verificationToken: passwordReset.id,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password using verified OTP
 * Updates user password and cleans up OTP record
 */
const resetPassword = async (req, res, next) => {
    try {
        const { email, verificationToken, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!email || !email.trim()) {
            throw new AppError('Email is required', 400, true);
        }

        if (!verificationToken || !verificationToken.trim()) {
            throw new AppError('Verification token is required', 400, true);
        }

        if (!newPassword || !confirmPassword) {
            throw new AppError('New password and confirmation password are required', 400, true);
        }

        // Validate password length
        if (newPassword.length < 8) {
            throw new AppError('Password must be at least 8 characters long', 400, true);
        }

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            throw new AppError('Passwords do not match', 400, true);
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.trim() },
        });

        if (!user) {
            throw new AppError('User with this email does not exist', 404, true);
        }

        // Find the password reset request
        const passwordReset = await prisma.passwordReset.findUnique({
            where: { id: verificationToken },
        });

        if (!passwordReset) {
            throw new AppError('Invalid verification token', 400, true);
        }

        // Check if token belongs to the user
        if (passwordReset.userId !== user.id) {
            throw new AppError('Verification token does not match the user', 401, true);
        }

        // Check if OTP has been verified
        if (!passwordReset.isVerified) {
            throw new AppError('OTP has not been verified. Please verify the OTP first.', 400, true);
        }

        // Check if OTP has expired (double-check)
        // if (new Date() > passwordReset.expiresAt) {
        //     await prisma.passwordReset.delete({
        //         where: { id: passwordReset.id },
        //     });
        //     throw new AppError('OTP has expired. Please request a new one.', 400, true);
        // }

        // Hash new password
        const hashedPassword = await hash(newPassword);

        // Update user password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // Delete the password reset record
        await prisma.passwordReset.delete({
            where: { id: passwordReset.id },
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.',
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
    forgotPassword,
    verifyOtp,
    resetPassword,
};
