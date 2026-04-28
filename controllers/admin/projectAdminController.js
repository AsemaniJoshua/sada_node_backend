// Admin projects controller - CRUD operations with image management
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteMultipleImagesFromCloudinary } from '../../config/cloudinaryUpload.js';

/**
 * Create new project with images
 * Images are required for project creation
 */
const createProject = async (req, res, next) => {
    try {
        const { title, description, budget, category, progress, status, isFeatured, start_date, end_date } = req.body;
        const files = req.files;

        // Validate required fields
        if (!title || !description || budget === undefined || !category || progress === undefined || !start_date) {
            throw new AppError('title, description, budget, category, progress, and start_date are required', 400, true);
        }

        // Validate images are provided (required)
        if (!files || files.length === 0) {
            throw new AppError('At least one image is required', 400, true);
        }

        // Validate budget is a positive number
        if (typeof budget !== 'number' || budget <= 0) {
            throw new AppError('budget must be a positive number', 400, true);
        }

        // Validate progress is between 0-100
        if (typeof progress !== 'number' || progress < 0 || progress > 100) {
            throw new AppError('progress must be a number between 0 and 100', 400, true);
        }

        // Validate status enum
        const validStatuses = ['planned', 'in_progress', 'paused', 'completed', 'cancelled'];
        const normalizedStatus = status ? status.replace('-', '_') : 'planned';
        if (!validStatuses.includes(normalizedStatus)) {
            throw new AppError('Invalid status. Must be one of: planned, in_progress, paused, completed, cancelled', 400, true);
        }

        // Validate isFeatured is boolean if provided
        if (isFeatured !== undefined && typeof isFeatured !== 'boolean') {
            throw new AppError('isFeatured must be a boolean', 400, true);
        }

        // Validate dates
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
            throw new AppError('Invalid start_date format', 400, true);
        }

        let endDate = null;
        if (end_date) {
            endDate = new Date(end_date);
            if (isNaN(endDate.getTime())) {
                throw new AppError('Invalid end_date format', 400, true);
            }
            if (endDate <= startDate) {
                throw new AppError('end_date must be after start_date', 400, true);
            }
        }

        // Upload all images to Cloudinary
        const uploadedImages = [];
        for (const file of files) {
            try {
                const cloudinaryImage = await uploadImageToCloudinary(file.buffer, 'projects');
                uploadedImages.push(cloudinaryImage);
            } catch (uploadError) {
                // Cleanup already uploaded images if new upload fails
                if (uploadedImages.length > 0) {
                    await deleteMultipleImagesFromCloudinary(
                        uploadedImages.map(img => img.public_id)
                    );
                }
                throw uploadError;
            }
        }

        // Create project with uploaded images
        const project = await prisma.project.create({
            data: {
                title,
                description,
                budget,
                category,
                progress,
                status: normalizedStatus,
                isFeatured: isFeatured || false,
                start_date: startDate,
                end_date: endDate,
                images: uploadedImages,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Project created successfully.',
            data: project,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get all projects (admin view) with optional filters
 */
const getAllProjects = async (req, res, next) => {
    try {
        const { status, category, isFeatured } = req.query;

        // Build filter conditions
        const where = {};

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

        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured === 'true' || isFeatured === true;
        }

        // Fetch all projects ordered by latest first
        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

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

        res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Update project by ID (PATCH - partial update)
 * Can update title, description, budget, category, progress, status, isFeatured, dates, and/or images
 * If new images provided, old images are auto-deleted from Cloudinary
 */
const updateProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, budget, category, progress, status, isFeatured, start_date, end_date } = req.body;
        const files = req.files;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id },
        });

        if (!existingProject) {
            throw new AppError('Project not found', 404, true);
        }

        // Validate budget if provided
        if (budget !== undefined && (typeof budget !== 'number' || budget <= 0)) {
            throw new AppError('budget must be a positive number', 400, true);
        }

        // Validate progress if provided
        if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
            throw new AppError('progress must be a number between 0 and 100', 400, true);
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['planned', 'in_progress', 'paused', 'completed', 'cancelled'];
            const normalizedStatus = status.replace('-', '_');
            if (!validStatuses.includes(normalizedStatus)) {
                throw new AppError('Invalid status. Must be one of: planned, in_progress, paused, completed, cancelled', 400, true);
            }
        }

        // Validate isFeatured is boolean if provided
        if (isFeatured !== undefined && typeof isFeatured !== 'boolean') {
            throw new AppError('isFeatured must be a boolean', 400, true);
        }

        // Validate dates if provided
        let startDate = null;
        let endDate = null;
        if (start_date) {
            startDate = new Date(start_date);
            if (isNaN(startDate.getTime())) {
                throw new AppError('Invalid start_date format', 400, true);
            }
        }

        if (end_date) {
            endDate = new Date(end_date);
            if (isNaN(endDate.getTime())) {
                throw new AppError('Invalid end_date format', 400, true);
            }
            const finalStartDate = startDate || existingProject.start_date;
            if (endDate <= finalStartDate) {
                throw new AppError('end_date must be after start_date', 400, true);
            }
        }

        // Handle image upload/replacement if new images provided
        let uploadedImages = null;
        if (files && files.length > 0) {
            uploadedImages = [];
            for (const file of files) {
                try {
                    const cloudinaryImage = await uploadImageToCloudinary(file.buffer, 'projects');
                    uploadedImages.push(cloudinaryImage);
                } catch (uploadError) {
                    // Cleanup already uploaded images if new upload fails
                    if (uploadedImages.length > 0) {
                        await deleteMultipleImagesFromCloudinary(
                            uploadedImages.map(img => img.public_id)
                        );
                    }
                    throw uploadError;
                }
            }

            // Delete old images from Cloudinary if new images provided
            if (existingProject.images && Array.isArray(existingProject.images)) {
                const oldPublicIds = existingProject.images
                    .map(img => img.public_id)
                    .filter(id => id);
                if (oldPublicIds.length > 0) {
                    await deleteMultipleImagesFromCloudinary(oldPublicIds);
                }
            }
        }

        // Build update data (only include provided fields)
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (budget !== undefined) updateData.budget = budget;
        if (category !== undefined) updateData.category = category;
        if (progress !== undefined) updateData.progress = progress;
        if (status !== undefined) updateData.status = status.replace('-', '_');
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        if (startDate !== null) updateData.start_date = startDate;
        if (endDate !== null) updateData.end_date = endDate;
        if (uploadedImages !== null) updateData.images = uploadedImages;

        // Update project
        const updatedProject = await prisma.project.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'Project updated successfully.',
            data: updatedProject,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Delete project by ID with Cloudinary image cleanup
 */
const deleteProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Get project to extract image public_ids
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            throw new AppError('Project not found', 404, true);
        }

        // Collect all Cloudinary public_ids for deletion
        const publicIds = [];
        if (project.images && Array.isArray(project.images)) {
            project.images.forEach((image) => {
                if (image.public_id) {
                    publicIds.push(image.public_id);
                }
            });
        }

        // Delete images from Cloudinary
        if (publicIds.length > 0) {
            await deleteMultipleImagesFromCloudinary(publicIds);
        }

        // Delete project from database
        await prisma.project.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createProject,
    getAllProjects,
    getProjectById,
    updateProjectById,
    deleteProjectById,
};
