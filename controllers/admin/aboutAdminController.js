// Admin about controller - CRUD operations for about page
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { logActivity } from '../../utils/activity/logActivity.js';
import { processRichTextImages } from '../../config/cloudinaryUpload.js';

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

        // Process base64 rich-text images if present in mission, vision, or history
        const processedMission = await processRichTextImages(mission, 'about/mission');
        const processedVision = await processRichTextImages(vision, 'about/vision');
        const processedHistory = await processRichTextImages(history, 'about/history');

        // Create about record
        const about = await prisma.about.create({
            data: {
                mission: processedMission,
                vision: processedVision,
                coreValues,
                history: processedHistory,
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'About',
            entity: 'About',
            entityId: about.id,
            description: `Created about page record`,
            metadata: { id: about.id },
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
        if (mission !== undefined) updateData.mission = await processRichTextImages(mission, 'about/mission');
        if (vision !== undefined) updateData.vision = await processRichTextImages(vision, 'about/vision');
        if (coreValues !== undefined) updateData.coreValues = coreValues;
        if (history !== undefined) updateData.history = await processRichTextImages(history, 'about/history');

        // Update about record
        const updatedAbout = await prisma.about.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'About',
            entity: 'About',
            entityId: id,
            description: `Updated about page record`,
            metadata: updateData,
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

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'About',
            entity: 'About',
            entityId: id,
            description: `Deleted about page record`,
            metadata: { id },
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
