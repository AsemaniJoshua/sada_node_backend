// Admin Journey controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

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

        // Create journey in database
        const journey = await prisma.journey.create({
            data: {
                year: year.trim(),
                title: title.trim(),
                description: description.trim(),
                category: category.trim(),
                status: status || 'draft',
            },
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
        const journeys = await prisma.journey.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
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
            updateData.description = description.trim();
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
