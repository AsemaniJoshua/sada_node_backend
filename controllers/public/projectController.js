// Public projects controller - Fetch projects data
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get all projects
 */
const getAllProjects = async (req, res, next) => {
    try {
        // Fetch all projects ordered by latest first
        const projects = await prisma.project.findMany({
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
 * Get project by ID
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

        // Check if project exists
        if (!project) {
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
