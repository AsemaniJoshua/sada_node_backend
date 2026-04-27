// Admin about controller - CRUD operations for about page
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Create new about record
 * For singleton, typically only 1 record should exist
 */
const createAbout = async (req, res, next) => {
    try {
        const { mission, vision, coreValues, history } = req.body;

        // Validate required fields
        if (!mission || !vision || !coreValues || !history) {
            throw new AppError(
                'mission, vision, coreValues, and history are required',
                400,
                true
            );
        }

        // Validate coreValues is array
        if (!Array.isArray(coreValues)) {
            throw new AppError('coreValues must be an array', 400, true);
        }

        // Create about record
        const about = await prisma.about.create({
            data: {
                mission,
                vision,
                coreValues,
                history,
            },
        });

        res.status(201).json({
            success: true,
            message: 'About page created successfully.',
            data: about,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get all about records
 * For singleton, should return array with 1 record
 */
const getAllAbouts = async (req, res, next) => {
    try {
        const abouts = await prisma.about.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: abouts,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get about record by ID
 */
const getAboutById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        const about = await prisma.about.findUnique({
            where: { id },
        });

        if (!about) {
            throw new AppError('About record not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: about,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Update about record by ID (PATCH - partial update)
 */
const updateAboutById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mission, vision, coreValues, history } = req.body;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if about record exists
        const existingAbout = await prisma.about.findUnique({
            where: { id },
        });

        if (!existingAbout) {
            throw new AppError('About record not found', 404, true);
        }

        // Validate array fields if provided
        if (coreValues && !Array.isArray(coreValues)) {
            throw new AppError('coreValues must be an array', 400, true);
        }

        // Build update data (only include provided fields)
        const updateData = {};
        if (mission !== undefined) updateData.mission = mission;
        if (vision !== undefined) updateData.vision = vision;
        if (coreValues !== undefined) updateData.coreValues = coreValues;
        if (history !== undefined) updateData.history = history;

        // Update about record
        const updatedAbout = await prisma.about.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'About page updated successfully.',
            data: updatedAbout,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Delete about record by ID
 */
const deleteAboutById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if about record exists
        const about = await prisma.about.findUnique({
            where: { id },
        });

        if (!about) {
            throw new AppError('About record not found', 404, true);
        }

        // Delete about record from database
        await prisma.about.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'About page deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createAbout,
    getAllAbouts,
    getAboutById,
    updateAboutById,
    deleteAboutById,
};
