// Admin gallery controller with CRUD operations and image management
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteMultipleImagesFromCloudinary } from '../../config/cloudinaryUpload.js';
import { logActivity } from '../../utils/activity/logActivity.js';
import { broadcastNotification, saveNotification } from '../../utils/notifications/pushService.js';

// Create new gallery entry with primary image and related images
const createGallery = async (req, res, next) => {
    try {
        const { title, description, event_date, category } = req.body;
        const primaryImageFile = req.files?.primary_image?.[0];
        const relatedImagesFiles = req.files?.images || [];

        // Validate required fields
        if (!title || !title.trim()) {
            return next(new AppError('Title is required and cannot be empty', 400, true));
        }

        if (!description || !description.trim()) {
            return next(new AppError('Description is required and cannot be empty', 400, true));
        }

        if (!event_date) {
            return next(new AppError('Event date is required', 400, true));
        }

        if (!category || !category.trim()) {
            return next(new AppError('Category is required and cannot be empty', 400, true));
        }

        if (!primaryImageFile) {
            return next(new AppError('Primary image is required', 400, true));
        }

        if (!relatedImagesFiles || relatedImagesFiles.length === 0) {
            return next(new AppError('At least one related image is required', 400, true));
        }

        // Upload primary image to Cloudinary
        const primaryImage = await uploadImageToCloudinary(primaryImageFile.buffer, 'gallery/primary');

        // Upload all related images to Cloudinary
        const relatedImages = await Promise.all(
            relatedImagesFiles.map((file) => uploadImageToCloudinary(file.buffer, 'gallery/related'))
        );

        // Create gallery entry in database
        const gallery = await prisma.gallery.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                primary_image: primaryImage,
                event_date: new Date(event_date),
                category: category.trim(),
                images: relatedImages,
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Gallery',
            entity: 'Gallery',
            entityId: gallery.id,
            description: `Created gallery entry: "${gallery.title}"`,
            metadata: { title: gallery.title, category: gallery.category },
        });
        // Send push notification
        const notificationPayload = {
            title: 'New Gallery Photos!',
            body: gallery.title,
            url: `/gallery/${gallery.id}`,
            icon: gallery.primaryImage || null
        };
        broadcastNotification(notificationPayload);
        saveNotification(notificationPayload);

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
        const { title, description, event_date, category } = req.body;
        const primaryImageFile = req.files?.primary_image?.[0];
        const relatedImagesFiles = req.files?.images || [];

        // Find existing gallery
        const gallery = await prisma.gallery.findUnique({
            where: { id },
        });

        if (!gallery) {
            return next(new AppError('Gallery not found', 404, true));
        }

        // Prepare update data
        const updateData = {};

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

        // Update event_date if provided
        if (event_date) {
            updateData.event_date = new Date(event_date);
        }

        // Update category if provided
        if (category) {
            if (!category.trim()) {
                return next(new AppError('Category cannot be empty', 400, true));
            }
            updateData.category = category.trim();
        }

        // Handle primary image update
        if (primaryImageFile) {
            const newPrimaryImage = await uploadImageToCloudinary(primaryImageFile.buffer, 'gallery/primary');
            updateData.primary_image = newPrimaryImage;

            // Delete old primary image from Cloudinary if it exists
            if (gallery.primary_image?.public_id) {
                const { deleteImageFromCloudinary } = await import('../../config/cloudinaryUpload.js');
                await deleteImageFromCloudinary(gallery.primary_image.public_id);
            }
        }

        // Handle related images update
        if (relatedImagesFiles && relatedImagesFiles.length > 0) {
            const newRelatedImages = await Promise.all(
                relatedImagesFiles.map((file) => uploadImageToCloudinary(file.buffer, 'gallery/related'))
            );
            updateData.images = newRelatedImages;

            // Delete old related images from Cloudinary if they exist
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

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Gallery',
            entity: 'Gallery',
            entityId: id,
            description: `Updated gallery entry: "${updatedGallery.title}"`,
            metadata: { title: updatedGallery.title, category: updatedGallery.category },
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
        const { deleteImageFromCloudinary } = await import('../../config/cloudinaryUpload.js');

        // Find gallery
        const gallery = await prisma.gallery.findUnique({
            where: { id },
        });

        if (!gallery) {
            return next(new AppError('Gallery not found', 404, true));
        }

        // Delete primary image from Cloudinary if exists
        if (gallery.primary_image?.public_id) {
            await deleteImageFromCloudinary(gallery.primary_image.public_id);
        }

        // Delete related images from Cloudinary if exist
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

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Gallery',
            entity: 'Gallery',
            entityId: id,
            description: `Deleted gallery entry: "${gallery.title}"`,
            metadata: { id, title: gallery.title, category: gallery.category },
        });

        // Save notification for history (Admin Inbox)
        saveNotification({
            title: 'Gallery Entry Deleted',
            body: `Admin deleted gallery item: "${gallery.title}"`,
        });

        res.status(200).json({
            success: true,
            message: 'Gallery entry deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Upload gallery entry with images
const uploadGalleryImage = async (req, res, next) => {
    try {
        const { title, description, event_date, category } = req.body;
        const primaryImageFile = req.files?.primary_image?.[0];
        const relatedImagesFiles = req.files?.images || [];

        // Validate required fields
        if (!title || !title.trim()) {
            return next(new AppError('Title is required and cannot be empty', 400, true));
        }

        if (!description || !description.trim()) {
            return next(new AppError('Description is required and cannot be empty', 400, true));
        }

        if (!event_date) {
            return next(new AppError('Event date is required', 400, true));
        }

        if (!category || !category.trim()) {
            return next(new AppError('Category is required and cannot be empty', 400, true));
        }

        if (!primaryImageFile) {
            return next(new AppError('Primary image is required', 400, true));
        }

        if (!relatedImagesFiles || relatedImagesFiles.length === 0) {
            return next(new AppError('At least one related image is required', 400, true));
        }

        // Upload primary image to Cloudinary
        const primaryImage = await uploadImageToCloudinary(primaryImageFile.buffer, 'gallery/primary');

        // Upload all related images to Cloudinary
        const relatedImages = await Promise.all(
            relatedImagesFiles.map((file) => uploadImageToCloudinary(file.buffer, 'gallery/related'))
        );

        // Create gallery entry with images
        const gallery = await prisma.gallery.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                primary_image: primaryImage,
                event_date: new Date(event_date),
                category: category.trim(),
                images: relatedImages,
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

export {
    createGallery,
    getAllGalleries,
    getGalleryById,
    updateGalleryById,
    deleteGalleryById,
    uploadGalleryImage,
};
