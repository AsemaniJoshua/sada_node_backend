// Admin home controller - CRUD operations for home page
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { deleteMultipleImagesFromCloudinary } from '../../config/cloudinaryUpload.js';

/**
 * Create new home record
 * For singleton, typically only 1 record should exist
 */
const createHome = async (req, res, next) => {
    try {
        const { statistics, featuredProjects } = req.body;

        // Validate required fields
        if (!statistics || !featuredProjects) {
            throw new AppError('statistics and featuredProjects are required', 400, true);
        }

        // Validate statistics is array
        if (!Array.isArray(statistics)) {
            throw new AppError('statistics must be an array', 400, true);
        }

        // Validate featuredProjects is array
        if (!Array.isArray(featuredProjects)) {
            throw new AppError('featuredProjects must be an array', 400, true);
        }

        // Create home record
        const home = await prisma.home.create({
            data: {
                statistics,
                featuredProjects,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Home page created successfully.',
            data: home,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get all home records
 * For singleton, should return array with 1 record
 */
const getAllHomes = async (req, res, next) => {
    try {
        const homes = await prisma.home.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: homes,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get home record by ID
 */
const getHomeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        const home = await prisma.home.findUnique({
            where: { id },
        });

        if (!home) {
            throw new AppError('Home record not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: home,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Update home record by ID (PATCH - partial update)
 */
const updateHomeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { statistics, featuredProjects } = req.body;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if home record exists
        const existingHome = await prisma.home.findUnique({
            where: { id },
        });

        if (!existingHome) {
            throw new AppError('Home record not found', 404, true);
        }

        // Validate array fields if provided
        if (statistics && !Array.isArray(statistics)) {
            throw new AppError('statistics must be an array', 400, true);
        }

        if (featuredProjects && !Array.isArray(featuredProjects)) {
            throw new AppError('featuredProjects must be an array', 400, true);
        }

        // Build update data (only include provided fields)
        const updateData = {};
        if (statistics !== undefined) updateData.statistics = statistics;
        if (featuredProjects !== undefined) updateData.featuredProjects = featuredProjects;

        // Update home record
        const updatedHome = await prisma.home.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'Home page updated successfully.',
            data: updatedHome,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Delete home record by ID with Cloudinary cleanup
 */
const deleteHomeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Get home record to extract image public_ids
        const home = await prisma.home.findUnique({
            where: { id },
        });

        if (!home) {
            throw new AppError('Home record not found', 404, true);
        }

        // Collect all Cloudinary public_ids for deletion
        const publicIds = [];

        // Extract featured projects image public_ids
        if (home.featuredProjects && Array.isArray(home.featuredProjects)) {
            home.featuredProjects.forEach((project) => {
                if (project.image && project.image.public_id) {
                    publicIds.push(project.image.public_id);
                }
            });
        }

        // Delete from Cloudinary
        if (publicIds.length > 0) {
            await deleteMultipleImagesFromCloudinary(publicIds);
        }

        // Delete home record from database
        await prisma.home.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Home page deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createHome,
    getAllHomes,
    getHomeById,
    updateHomeById,
    deleteHomeById,
};
