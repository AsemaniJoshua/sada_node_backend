// Admin User Controller - Manage admin profiles
import { hash, verify } from 'argon2';
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../config/cloudinaryUpload.js';

/**
 * Update current admin profile
 * Allows updating name, email, profile image, and password
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
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
            const isPasswordValid = await verify(user.password, oldPassword);
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
            updateData.password = await hash(newPassword);
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

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

export {
    updateProfile,
};
