// Admin Leadership controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../config/cloudinaryUpload.js';

// Create new leadership profile
const createLeadership = async (req, res, next) => {
    try {
        const { name, position, bio } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return next(new AppError('Name is required and cannot be empty', 400, true));
        }

        if (!position || !position.trim()) {
            return next(new AppError('Position is required and cannot be empty', 400, true));
        }

        if (!bio || !bio.trim()) {
            return next(new AppError('Bio is required and cannot be empty', 400, true));
        }

        // Validate image is provided
        if (!req.file) {
            return next(new AppError('Image is required', 400, true));
        }

        // Upload image to Cloudinary
        const imageData = await uploadImageToCloudinary(req.file.buffer, 'sada/leadership');

        // Create leadership profile in database
        const leadershipProfile = await prisma.leadership.create({
            data: {
                name: name.trim(),
                position: position.trim(),
                bio: bio.trim(),
                image: imageData,
            },
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
        const { name, position, bio } = req.body;

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

        // Update position if provided
        if (position) {
            if (!position.trim()) {
                return next(new AppError('Position cannot be empty', 400, true));
            }
            updateData.position = position.trim();
        }

        // Update bio if provided
        if (bio) {
            if (!bio.trim()) {
                return next(new AppError('Bio cannot be empty', 400, true));
            }
            updateData.bio = bio.trim();
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
