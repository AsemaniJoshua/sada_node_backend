// Admin gallery controller with CRUD operations and image management
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteMultipleImagesFromCloudinary } from '../../config/cloudinaryUpload.js';
import fs from 'fs';

// Create new gallery entry with multiple image uploads
const createGallery = async (req, res, next) => {
    try {
        const { title } = req.body;
        const files = req.files;

        // Validate required fields
        if (!title || !title.trim()) {
            return next(new AppError('Title is required and cannot be empty', 400, true));
        }

        if (!files || files.length === 0) {
            return next(new AppError('At least one image is required', 400, true));
        }

        // Upload all images to Cloudinary
        const images = await Promise.all(
            files.map((file) => uploadImageToCloudinary(file.path, 'gallery'))
        );

        // Create gallery entry in database
        const gallery = await prisma.gallery.create({
            data: {
                title: title.trim(),
                images: images,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Gallery entry created successfully.',
            data: gallery,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get all gallery entries (admin view)
const getAllGalleries = async (req, res, next) => {
    try {
        const galleries = await prisma.gallery.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: galleries,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get gallery by ID (admin view)
const getGalleryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const gallery = await prisma.gallery.findUnique({
            where: { id },
        });

        if (!gallery) {
            return next(new AppError('Gallery not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: gallery,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Update gallery by ID with optional image replacement
const updateGalleryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const files = req.files;

        // Find existing gallery
        const gallery = await prisma.gallery.findUnique({
            where: { id },
        });

        if (!gallery) {
            // Clean up uploaded files if gallery not found
            if (files && files.length > 0) {
                files.forEach((file) => fs.unlinkSync(file.path));
            }
            return next(new AppError('Gallery not found', 404, true));
        }

        // Prepare update data
        const updateData = {};

        // Update title if provided
        if (title) {
            if (!title.trim()) {
                if (files && files.length > 0) {
                    files.forEach((file) => fs.unlinkSync(file.path));
                }
                return next(new AppError('Title cannot be empty', 400, true));
            }
            updateData.title = title.trim();
        }

        // Handle image update
        if (files && files.length > 0) {
            // Upload new images to Cloudinary
            const newImages = await Promise.all(
                files.map((file) => uploadImageToCloudinary(file.path, 'gallery'))
            );
            updateData.images = newImages;

            // Delete old images from Cloudinary if they exist
            if (gallery.images && Array.isArray(gallery.images) && gallery.images.length > 0) {
                const oldPublicIds = gallery.images.map((img) => img.public_id);
                if (oldPublicIds.length > 0) {
                    await deleteMultipleImagesFromCloudinary(oldPublicIds);
                }
            }
        }

        // Update gallery in database
        const updatedGallery = await prisma.gallery.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'Gallery entry updated successfully.',
            data: updatedGallery,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Delete gallery by ID with image cleanup
const deleteGalleryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find gallery
        const gallery = await prisma.gallery.findUnique({
            where: { id },
        });

        if (!gallery) {
            return next(new AppError('Gallery not found', 404, true));
        }

        // Delete images from Cloudinary if exist
        if (gallery.images && Array.isArray(gallery.images) && gallery.images.length > 0) {
            const publicIds = gallery.images.map((img) => img.public_id);
            if (publicIds.length > 0) {
                await deleteMultipleImagesFromCloudinary(publicIds);
            }
        }

        // Delete gallery from database
        await prisma.gallery.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Gallery entry deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Upload single image as gallery entry
const uploadGalleryImage = async (req, res, next) => {
    try {
        const { title } = req.body;
        const files = req.files;

        // Validate required fields
        if (!title || !title.trim()) {
            return next(new AppError('Title is required and cannot be empty', 400, true));
        }

        // Validate images are provided
        if (!files || files.length === 0) {
            return next(new AppError('At least one image is required', 400, true));
        }

        // Upload all images to Cloudinary
        const images = await Promise.all(
            files.map((file) => uploadImageToCloudinary(file.path, 'sada/gallery'))
        );

        // Create gallery entry with images
        const gallery = await prisma.gallery.create({
            data: {
                title: title.trim(),
                images: images,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully.',
            data: gallery,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createGallery,
    getAllGalleries,
    getGalleryById,
    updateGalleryById,
    deleteGalleryById,
    uploadGalleryImage,
};
