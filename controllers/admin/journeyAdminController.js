// Admin Journey controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { logActivity } from '../../utils/activity/logActivity.js';
import { processRichTextImages } from '../../config/cloudinaryUpload.js';

// Create new journey milestone
const createJourney = async (req, res, next) => {
    try {
        const { year, title, description, category, status } = req.body;

        // Validate required fields
        if (!year || !year.trim()) {
            return next(new AppError('Year is required and cannot be empty', 400, true));
        }

        if (!title || !title.trim()) {
            return next(new AppError('Title is required and cannot be empty', 400, true));
        }

        if (!description || !description.trim()) {
            return next(new AppError('Description is required and cannot be empty', 400, true));
        }

        if (!category || !category.trim()) {
            return next(new AppError('Category is required and cannot be empty', 400, true));
        }

        // Validate status if provided
        if (status && !['published', 'draft'].includes(status)) {
            return next(new AppError('Status must be either "published" or "draft"', 400, true));
        }

        // Process base64 rich-text images if present in description
        const processedDescription = await processRichTextImages(description, 'journey/content');

        // Create journey in database
        const journey = await prisma.journey.create({
            data: {
                year: year.trim(),
                title: title.trim(),
                description: processedDescription.trim(),
                category: category.trim(),
                status: status || 'draft',
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Journey',
            entity: 'Journey',
            entityId: journey.id,
            description: `Created journey milestone: "${journey.title}" (${journey.year})`,
            metadata: { title: journey.title, year: journey.year, category: journey.category, status: journey.status },
        });

        res.status(201).json({
            success: true,
            message: 'Journey milestone created successfully.',
            data: journey,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get all journey milestones (admin view)
const getAllJourneys = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [journeys, total] = await Promise.all([
            prisma.journey.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.journey.count()
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            data: journeys,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get journey milestone by ID (admin view)
const getJourneyById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const journey = await prisma.journey.findUnique({
            where: { id },
        });

        if (!journey) {
            return next(new AppError('Journey milestone not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: journey,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Update journey milestone by ID
const updateJourneyById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { year, title, description, category, status } = req.body;

        // Find existing journey
        const journey = await prisma.journey.findUnique({
            where: { id },
        });

        if (!journey) {
            return next(new AppError('Journey milestone not found', 404, true));
        }

        // Prepare update data
        const updateData = {};

        // Update year if provided
        if (year) {
            if (!year.trim()) {
                return next(new AppError('Year cannot be empty', 400, true));
            }
            updateData.year = year.trim();
        }

        // Update title if provided
        if (title) {
            if (!title.trim()) {
                return next(new AppError('Title cannot be empty', 400, true));
            }
            updateData.title = title.trim();
        }

        // Update description if provided
        if (description) {
            if (!description.trim()) {
                return next(new AppError('Description cannot be empty', 400, true));
            }
            updateData.description = (await processRichTextImages(description, 'journey/content')).trim();
        }

        // Update category if provided
        if (category) {
            if (!category.trim()) {
                return next(new AppError('Category cannot be empty', 400, true));
            }
            updateData.category = category.trim();
        }

        // Update status if provided
        if (status) {
            if (!['published', 'draft'].includes(status)) {
                return next(new AppError('Status must be either "published" or "draft"', 400, true));
            }
            updateData.status = status;
        }

        // Update journey in database
        const updatedJourney = await prisma.journey.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Journey',
            entity: 'Journey',
            entityId: id,
            description: `Updated journey milestone: "${updatedJourney.title}"`,
            metadata: { title: updatedJourney.title, year: updatedJourney.year, status: updatedJourney.status },
        });

        res.status(200).json({
            success: true,
            message: 'Journey milestone updated successfully.',
            data: updatedJourney,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Delete journey milestone by ID
const deleteJourneyById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find journey
        const journey = await prisma.journey.findUnique({
            where: { id },
        });

        if (!journey) {
            return next(new AppError('Journey milestone not found', 404, true));
        }

        // Delete journey from database
        await prisma.journey.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Journey',
            entity: 'Journey',
            entityId: id,
            description: `Deleted journey milestone: "${journey.title}"`,
            metadata: { id, title: journey.title, year: journey.year },
        });

        res.status(200).json({
            success: true,
            message: 'Journey milestone deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createJourney,
    getAllJourneys,
    getJourneyById,
    updateJourneyById,
    deleteJourneyById,
};
