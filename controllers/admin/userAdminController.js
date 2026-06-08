// Admin User Controller - Manage admin profiles
import bcrypt from 'bcryptjs';
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../config/cloudinaryUpload.js';
import { logActivity } from '../../utils/activity/logActivity.js';
import { saveNotification } from '../../utils/notifications/pushService.js';

/**
 * Update current admin profile
 * Allows updating name, email, profile image, and password
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { name, email, oldPassword, newPassword, confirmNewPassword } = req.body;
        const file = req.file;

        // Find existing user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError('User not found', 404, true);
        }

        // Prepare update data
        const updateData = {};

        // Update name if provided
        if (name && name.trim()) {
            updateData.name = name.trim();
        }

        // Update email if provided
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                throw new AppError('Invalid email format', 400, true);
            }

            // Check if email is already taken by another user
            if (email.trim() !== user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: email.trim() },
                });
                if (existingUser) {
                    throw new AppError('Email already in use', 409, true);
                }
                updateData.email = email.trim();
            }
        }

        // Handle password update if oldPassword is provided
        if (oldPassword) {
            // Verify old password
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                throw new AppError('Invalid old password', 401, true);
            }

            // Validate new password
            if (!newPassword || !confirmNewPassword) {
                throw new AppError('New password and confirmation are required', 400, true);
            }

            if (newPassword !== confirmNewPassword) {
                throw new AppError('New passwords do not match', 400, true);
            }

            if (newPassword.length < 8) {
                throw new AppError('New password must be at least 8 characters long', 400, true);
            }

            // Hash new password
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Handle image upload if a file is provided
        if (file) {
            // Upload new image
            const cloudinaryImage = await uploadImageToCloudinary(file.buffer, 'users');
            updateData.image = cloudinaryImage;

            // Delete old image if it exists
            if (user.image && typeof user.image === 'object' && user.image.public_id) {
                await deleteImageFromCloudinary(user.image.public_id);
            }
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            throw new AppError('No changes provided', 400, true);
        }

        // Update user record
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Users',
            entity: 'User',
            entityId: updatedUser.id,
            description: `Updated own profile (name: ${updatedUser.name})`,
            metadata: { name: updatedUser.name, email: updatedUser.email },
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all users
 * Returns a list of all users ordered by creation date
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                    role: true,
                    isFirstTimeLogin: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.user.count()
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID
 * Returns details for a specific user
 */
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new user
 * Allows admins to manually create user accounts
 */
const createUser = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        const file = req.file;

        // Validate required fields
        if (!email || !password || !name) {
            throw new AppError('Email, password, and name are required', 400, true);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            throw new AppError('Invalid email format', 400, true);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.trim() },
        });

        if (existingUser) {
            throw new AppError('User with this email already exists', 409, true);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare user data
        const userData = {
            email: email.trim(),
            password: hashedPassword,
            name: name.trim(),
            role: role || 'admin',
        };

        // Handle image upload if a file is provided
        if (file) {
            const cloudinaryImage = await uploadImageToCloudinary(file.buffer, 'users');
            userData.image = cloudinaryImage;
        }

        // Create user in database
        const newUser = await prisma.user.create({
            data: userData,
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                createdAt: true,
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Users',
            entity: 'User',
            entityId: newUser.id,
            description: `Created new user: ${newUser.name} (${newUser.email})`,
            metadata: { name: newUser.name, email: newUser.email, role: newUser.role },
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            data: newUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user by ID
 * Allows admins to update any user's details
 */
const updateUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;
        const file = req.file;

        // Find existing user
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new AppError('User not found', 404, true);
        }

        // Prepare update data
        const updateData = {};

        // Update name if provided
        if (name && name.trim()) {
            updateData.name = name.trim();
        }

        // Update email if provided
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                throw new AppError('Invalid email format', 400, true);
            }

            if (email.trim() !== user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: email.trim() },
                });
                if (existingUser) {
                    throw new AppError('Email already in use', 409, true);
                }
                updateData.email = email.trim();
            }
        }

        // Update role if provided
        if (role) {
            const allowedRoles = ['admin', 'user'];
            if (!allowedRoles.includes(role)) {
                throw new AppError('Invalid role', 400, true);
            }
            updateData.role = role;
        }

        // Update password if provided
        if (password) {
            if (password.length < 8) {
                throw new AppError('Password must be at least 8 characters long', 400, true);
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Handle image upload if a file is provided
        if (file) {
            const cloudinaryImage = await uploadImageToCloudinary(file.buffer, 'users');
            updateData.image = cloudinaryImage;

            // Delete old image if it exists
            if (user.image && typeof user.image === 'object' && user.image.public_id) {
                await deleteImageFromCloudinary(user.image.public_id);
            }
        }

        // Update user record
        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Users',
            entity: 'User',
            entityId: id,
            description: `Updated user: ${updatedUser.name} (${updatedUser.email})`,
            metadata: { name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
        });

        res.status(200).json({
            success: true,
            message: 'User updated successfully.',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user by ID
 * Removes user account and associated image from Cloudinary
 */
const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find user
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new AppError('User not found', 404, true);
        }

        // Prevent admin from deleting themselves through this endpoint
        // (They should use a specific self-delete or be deleted by another admin)
        if (user.id === req.user.userId) {
            throw new AppError('You cannot delete your own account from the user management list.', 400, true);
        }

        // Delete user from database
        await prisma.user.delete({
            where: { id },
        });

        // Delete image from Cloudinary if it exists
        if (user.image && typeof user.image === 'object' && user.image.public_id) {
            await deleteImageFromCloudinary(user.image.public_id);
        }

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Users',
            entity: 'User',
            entityId: id,
            description: `Deleted user: ${user.name} (${user.email})`,
            metadata: { id, name: user.name, email: user.email, role: user.role },
        });

        // Save notification for history (Admin Inbox)
        saveNotification({
            title: 'User Account Deleted',
            body: `Admin deleted ${user.role} account: ${user.name}`,
        });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

export {
    updateProfile,
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    deleteUserById,
};
