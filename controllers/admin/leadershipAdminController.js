// Admin Leadership controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../config/cloudinaryUpload.js';
import { logActivity } from '../../utils/activity/logActivity.js';

// Create new leadership profile
const createLeadership = async (req, res, next) => {
    try {
        const { name, role, email, bio, start_year, end_year, social_media, status } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return next(new AppError('Name is required and cannot be empty', 400, true));
        }

        if (!role || !role.trim()) {
            return next(new AppError('Role is required and cannot be empty', 400, true));
        }

        if (!email || !email.trim()) {
            return next(new AppError('Email is required and cannot be empty', 400, true));
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return next(new AppError('Invalid email format', 400, true));
        }

        if (!bio || !bio.trim()) {
            return next(new AppError('Bio is required and cannot be empty', 400, true));
        }

        if (!start_year || !start_year.trim()) {
            return next(new AppError('Start year is required and cannot be empty', 400, true));
        }

        // Validate image is provided
        if (!req.file) {
            return next(new AppError('Image is required', 400, true));
        }

        // Validate status if provided
        if (status && !['published', 'draft'].includes(status)) {
            return next(new AppError('Status must be either "published" or "draft"', 400, true));
        }

        // Upload image to Cloudinary
        const imageData = await uploadImageToCloudinary(req.file.buffer, 'sada/leadership');

        // Create leadership profile in database
        const leadershipProfile = await prisma.leadership.create({
            data: {
                name: name.trim(),
                role: role.trim(),
                email: email.trim(),
                bio: bio.trim(),
                image: imageData,
                start_year: start_year.trim(),
                end_year: end_year ? end_year.trim() : null,
                social_media: social_media || null,
                status: status || 'draft',
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Leadership',
            entity: 'Leadership',
            entityId: leadershipProfile.id,
            description: `Created leadership profile: ${leadershipProfile.name} (${leadershipProfile.role})`,
            metadata: { name: leadershipProfile.name, role: leadershipProfile.role, status: leadershipProfile.status },
        });

        res.status(201).json({
            success: true,
            message: 'Leadership profile created successfully.',
            data: leadershipProfile,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get all leadership profiles (admin view)
const getAllLeadership = async (req, res, next) => {
    try {
        const leadership = await prisma.leadership.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: leadership,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get leadership profile by ID (admin view)
const getLeadershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const leadershipProfile = await prisma.leadership.findUnique({
            where: { id },
        });

        if (!leadershipProfile) {
            return next(new AppError('Leadership profile not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: leadershipProfile,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Update leadership profile by ID
const updateLeadershipById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, role, email, bio, start_year, end_year, social_media, status } = req.body;

        // Find existing leadership profile
        const leadershipProfile = await prisma.leadership.findUnique({
            where: { id },
        });

        if (!leadershipProfile) {
            return next(new AppError('Leadership profile not found', 404, true));
        }

        // Prepare update data
        const updateData = {};

        // Update name if provided
        if (name) {
            if (!name.trim()) {
                return next(new AppError('Name cannot be empty', 400, true));
            }
            updateData.name = name.trim();
        }

        // Update role if provided
        if (role) {
            if (!role.trim()) {
                return next(new AppError('Role cannot be empty', 400, true));
            }
            updateData.role = role.trim();
        }

        // Update email if provided
        if (email) {
            if (!email.trim()) {
                return next(new AppError('Email cannot be empty', 400, true));
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return next(new AppError('Invalid email format', 400, true));
            }
            updateData.email = email.trim();
        }

        // Update bio if provided
        if (bio) {
            if (!bio.trim()) {
                return next(new AppError('Bio cannot be empty', 400, true));
            }
            updateData.bio = bio.trim();
        }

        // Update start_year if provided
        if (start_year) {
            if (!start_year.trim()) {
                return next(new AppError('Start year cannot be empty', 400, true));
            }
            updateData.start_year = start_year.trim();
        }

        // Update end_year if provided
        if (end_year !== undefined) {
            updateData.end_year = end_year ? end_year.trim() : null;
        }

        // Update social_media if provided
        if (social_media !== undefined) {
            updateData.social_media = social_media;
        }

        // Update status if provided
        if (status) {
            if (!['published', 'draft'].includes(status)) {
                return next(new AppError('Status must be either "published" or "draft"', 400, true));
            }
            updateData.status = status;
        }

        // Update image if provided
        if (req.file) {
            // Delete old image from Cloudinary
            if (leadershipProfile.image && leadershipProfile.image.public_id) {
                await deleteImageFromCloudinary(leadershipProfile.image.public_id);
            }

            // Upload new image to Cloudinary
            const imageData = await uploadImageToCloudinary(req.file.buffer, 'sada/leadership');
            updateData.image = imageData;
        }

        // Update leadership profile in database
        const updatedLeadershipProfile = await prisma.leadership.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Leadership',
            entity: 'Leadership',
            entityId: id,
            description: `Updated leadership profile: ${updatedLeadershipProfile.name}`,
            metadata: { name: updatedLeadershipProfile.name, role: updatedLeadershipProfile.role, status: updatedLeadershipProfile.status },
        });

        res.status(200).json({
            success: true,
            message: 'Leadership profile updated successfully.',
            data: updatedLeadershipProfile,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Delete leadership profile by ID
const deleteLeadershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find leadership profile
        const leadershipProfile = await prisma.leadership.findUnique({
            where: { id },
        });

        if (!leadershipProfile) {
            return next(new AppError('Leadership profile not found', 404, true));
        }

        // Delete image from Cloudinary
        if (leadershipProfile.image && leadershipProfile.image.public_id) {
            await deleteImageFromCloudinary(leadershipProfile.image.public_id);
        }

        // Delete leadership profile from database
        await prisma.leadership.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Leadership',
            entity: 'Leadership',
            entityId: id,
            description: `Deleted leadership profile: ${leadershipProfile.name}`,
            metadata: { id, name: leadershipProfile.name, role: leadershipProfile.role },
        });

        res.status(200).json({
            success: true,
            message: 'Leadership profile deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createLeadership,
    getAllLeadership,
    getLeadershipById,
    updateLeadershipById,
    deleteLeadershipById,
};
