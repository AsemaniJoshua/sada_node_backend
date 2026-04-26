// Admin Journey controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Create new journey milestone
const createJourney = async (req, res, next) => {
    try {
        const { year, event } = req.body;

        // Validate required fields
        if (!year || !year.trim()) {
            return next(new AppError('Year is required and cannot be empty', 400, true));
        }

        if (!event || !event.trim()) {
            return next(new AppError('Event is required and cannot be empty', 400, true));
        }

        // Create journey in database
        const journey = await prisma.journey.create({
            data: {
                year: year.trim(),
                event: event.trim(),
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
        const { year, event } = req.body;

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

        // Update event if provided
        if (event) {
            if (!event.trim()) {
                return next(new AppError('Event cannot be empty', 400, true));
            }
            updateData.event = event.trim();
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
