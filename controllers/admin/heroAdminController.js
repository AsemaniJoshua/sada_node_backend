// Admin hero controller with CRUD operations and image management
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../config/cloudinaryUpload.js';
import { logActivity } from '../../utils/activity/logActivity.js';

/**
 * Create new hero banner with image upload
 */
const createHero = async (req, res, next) => {
    try {
        const { title, subtitle, label, target_url, status } = req.body;
        const file = req.file;

        // Validate required fields
        if (!title || !title.trim()) {
            return next(new AppError('Title is required and cannot be empty', 400, true));
        }

        if (!subtitle || !subtitle.trim()) {
            return next(new AppError('Subtitle is required and cannot be empty', 400, true));
        }

        if (!label || !label.trim()) {
            return next(new AppError('Label is required and cannot be empty', 400, true));
        }

        if (!target_url || !target_url.trim()) {
            return next(new AppError('Target URL is required and cannot be empty', 400, true));
        }

        if (!file) {
            return next(new AppError('Image is required', 400, true));
        }

        // Validate status if provided
        if (status && !['published', 'draft'].includes(status)) {
            return next(new AppError('Status must be either "published" or "draft"', 400, true));
        }

        // Upload image to Cloudinary
        const { url, public_id } = await uploadImageToCloudinary(file.buffer, 'heroes');

        // Create hero entry in database
        const hero = await prisma.hero.create({
            data: {
                title: title.trim(),
                subtitle: subtitle.trim(),
                label: label.trim(),
                target_url: target_url.trim(),
                image: { url, public_id },
                status: status || 'draft',
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Hero',
            entity: 'Hero',
            entityId: hero.id,
            description: `Created hero banner: "${hero.title}"`,
            metadata: { title: hero.title, status: hero.status },
        });

        res.status(201).json({
            success: true,
            message: 'Hero created successfully.',
            data: hero,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get all hero banners (admin view - all statuses)
 */
const getAllHeroes = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [heroes, total] = await Promise.all([
            prisma.hero.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.hero.count()
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            data: heroes,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get hero by ID (admin view)
 */
const getHeroById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const hero = await prisma.hero.findUnique({
            where: { id },
        });

        if (!hero) {
            return next(new AppError('Hero not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: hero,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Update hero by ID with optional image replacement
 */
const updateHeroById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, subtitle, label, target_url, status } = req.body;
        const file = req.file;

        // Find existing hero
        const hero = await prisma.hero.findUnique({
            where: { id },
        });

        if (!hero) {
            return next(new AppError('Hero not found', 404, true));
        }

        // Prepare update data
        const updateData = {};

        // Update title if provided
        if (title) {
            if (!title.trim()) {
                return next(new AppError('Title cannot be empty', 400, true));
            }
            updateData.title = title.trim();
        }

        // Update subtitle if provided
        if (subtitle) {
            if (!subtitle.trim()) {
                return next(new AppError('Subtitle cannot be empty', 400, true));
            }
            updateData.subtitle = subtitle.trim();
        }

        // Update label if provided
        if (label) {
            if (!label.trim()) {
                return next(new AppError('Label cannot be empty', 400, true));
            }
            updateData.label = label.trim();
        }

        // Update target_url if provided
        if (target_url) {
            if (!target_url.trim()) {
                return next(new AppError('Target URL cannot be empty', 400, true));
            }
            updateData.target_url = target_url.trim();
        }

        // Update status if provided
        if (status) {
            if (!['published', 'draft'].includes(status)) {
                return next(new AppError('Status must be either "published" or "draft"', 400, true));
            }
            updateData.status = status;
        }

        // Handle image update
        if (file) {
            // Upload new image to Cloudinary
            const { url, public_id } = await uploadImageToCloudinary(file.buffer, 'heroes');
            updateData.image = { url, public_id };

            // Delete old image from Cloudinary if it exists
            if (hero.image?.public_id) {
                await deleteImageFromCloudinary(hero.image.public_id);
            }
        }

        // Update hero in database
        const updatedHero = await prisma.hero.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Hero',
            entity: 'Hero',
            entityId: id,
            description: `Updated hero banner: "${updatedHero.title}"`,
            metadata: { title: updatedHero.title, status: updatedHero.status },
        });

        res.status(200).json({
            success: true,
            message: 'Hero updated successfully.',
            data: updatedHero,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Delete hero by ID with image cleanup
 */
const deleteHeroById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find hero
        const hero = await prisma.hero.findUnique({
            where: { id },
        });

        if (!hero) {
            return next(new AppError('Hero not found', 404, true));
        }

        // Delete image from Cloudinary if exists
        if (hero.image?.public_id) {
            await deleteImageFromCloudinary(hero.image.public_id);
        }

        // Delete hero from database
        await prisma.hero.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Hero',
            entity: 'Hero',
            entityId: id,
            description: `Deleted hero banner: "${hero.title}"`,
            metadata: { id, title: hero.title },
        });

        res.status(200).json({
            success: true,
            message: 'Hero deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createHero,
    getAllHeroes,
    getHeroById,
    updateHeroById,
    deleteHeroById,
};
