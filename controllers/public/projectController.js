// Public projects controller - Fetch projects data
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get all featured projects
 * Only returns projects where isFeatured = true
 */
const getAllProjects = async (req, res, next) => {
    try {
        const { status, category } = req.query;

        // Build filter conditions - only featured projects
        const where = {
            isFeatured: true,
        };

        if (status) {
            const validStatuses = ['planned', 'in_progress', 'paused', 'completed', 'cancelled'];
            const normalizedStatus = status.replace('-', '_');
            if (!validStatuses.includes(normalizedStatus)) {
                throw new AppError('Invalid status. Must be one of: planned, in_progress, paused, completed, cancelled', 400, true);
            }
            where.status = normalizedStatus;
        }

        if (category) {
            where.category = category;
        }

        // Fetch featured projects ordered by latest first
        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Return projects data
        res.status(200).json({
            success: true,
            data: projects,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get featured project by ID
 * Only returns project if isFeatured = true
 */
const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Fetch project by ID
        const project = await prisma.project.findUnique({
            where: { id },
        });

        // Check if project exists and is featured
        if (!project) {
            throw new AppError('Project not found', 404, true);
        }

        if (!project.isFeatured) {
            throw new AppError('Project not found', 404, true);
        }

        // Return project data
        res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllProjects, getProjectById };
