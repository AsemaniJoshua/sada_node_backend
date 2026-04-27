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
        const { title, description, status } = req.body;
        const files = req.files;

        // Validate required fields
        if (!title || !description || !status) {
            throw new AppError('title, description, and status are required', 400, true);
        }

        // Validate images are provided (required)
        if (!files || files.length === 0) {
            throw new AppError('At least one image is required', 400, true);
        }

        // Validate status enum
        const validStatuses = ['planning', 'active', 'completed', 'on-hold', 'on_hold'];
        const normalizedStatus = status.replace('-', '_');
        if (!validStatuses.includes(normalizedStatus)) {
            throw new AppError('Invalid status. Must be one of: planning, active, completed, on-hold', 400, true);
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
                status: normalizedStatus,
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
 * Get all projects
 */
const getAllProjects = async (req, res, next) => {
    try {
        // Fetch all projects ordered by latest first
        const projects = await prisma.project.findMany({
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
 * Can update title, description, status, and/or images
 * If new images provided, old images are auto-deleted from Cloudinary
 */
const updateProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
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

        // Validate status if provided
        if (status) {
            const validStatuses = ['planning', 'active', 'completed', 'on-hold', 'on_hold'];
            const normalizedStatus = status.replace('-', '_');
            if (!validStatuses.includes(normalizedStatus)) {
                throw new AppError('Invalid status. Must be one of: planning, active, completed, on-hold', 400, true);
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
        if (status !== undefined) updateData.status = status.replace('-', '_');
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
