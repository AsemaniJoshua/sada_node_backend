// Admin testimonials controller with CRUD operations and image management
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../config/cloudinaryUpload.js';
import { logActivity } from '../../utils/activity/logActivity.js';

// Create new testimonial with image upload
const createTestimonial = async (req, res, next) => {
    try {
        const { name, role, text, ratings, status } = req.body;
        const file = req.file;

        // Validate required fields
        if (!name || !name.trim()) {
            return next(new AppError('Name is required and cannot be empty', 400, true));
        }

        if (!role || !role.trim()) {
            return next(new AppError('Role is required and cannot be empty', 400, true));
        }

        if (!text || !text.trim()) {
            return next(new AppError('Testimonial text is required and cannot be empty', 400, true));
        }

        if (!file) {
            return next(new AppError('Image is required', 400, true));
        }

        // Validate ratings
        if (ratings === undefined || ratings === null) {
            return next(new AppError('Ratings is required', 400, true));
        }

        const ratingsNum = parseInt(ratings);
        if (isNaN(ratingsNum) || ratingsNum < 0 || ratingsNum > 5) {
            return next(new AppError('Ratings must be a number between 0 and 5', 400, true));
        }

        // Validate status if provided
        if (status && !['published', 'draft'].includes(status)) {
            return next(new AppError('Status must be either "published" or "draft"', 400, true));
        }

        // Upload image to Cloudinary
        const { url, public_id } = await uploadImageToCloudinary(file.buffer, 'testimonials');

        // Create testimonial entry in database
        const testimonial = await prisma.testimonial.create({
            data: {
                name: name.trim(),
                role: role.trim(),
                text: text.trim(),
                image: { url, public_id },
                ratings: ratingsNum,
                status: status || 'draft',
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Testimonials',
            entity: 'Testimonial',
            entityId: testimonial.id,
            description: `Created testimonial from: ${testimonial.name} (${testimonial.role})`,
            metadata: { name: testimonial.name, role: testimonial.role, ratings: testimonial.ratings, status: testimonial.status },
        });

        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully.',
            data: testimonial,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get all testimonials (admin view)
const getAllTestimonials = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [testimonials, total] = await Promise.all([
            prisma.testimonial.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.testimonial.count()
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            data: testimonials,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get testimonial by ID (admin view)
const getTestimonialById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const testimonial = await prisma.testimonial.findUnique({
            where: { id },
        });

        if (!testimonial) {
            return next(new AppError('Testimonial not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: testimonial,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Update testimonial by ID with optional image replacement
const updateTestimonialById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, role, text, ratings, status } = req.body;
        const file = req.file;

        // Find existing testimonial
        const testimonial = await prisma.testimonial.findUnique({
            where: { id },
        });

        if (!testimonial) {
            return next(new AppError('Testimonial not found', 404, true));
        }

        // Prepare update data
        const updateData = {};

        // Update name if provided
        if (name) {
            if (!name.trim()) {
                return next(new AppError('Name cannot be empty', 400, true));
            }
            updateData.name = name.trim();
        }

        // Update role if provided
        if (role) {
            if (!role.trim()) {
                return next(new AppError('Role cannot be empty', 400, true));
            }
            updateData.role = role.trim();
        }

        // Update text if provided
        if (text) {
            if (!text.trim()) {
                return next(new AppError('Testimonial text cannot be empty', 400, true));
            }
            updateData.text = text.trim();
        }

        // Update ratings if provided
        if (ratings !== undefined && ratings !== null) {
            const ratingsNum = parseInt(ratings);
            if (isNaN(ratingsNum) || ratingsNum < 0 || ratingsNum > 5) {
                return next(new AppError('Ratings must be a number between 0 and 5', 400, true));
            }
            updateData.ratings = ratingsNum;
        }

        // Update status if provided
        if (status) {
            if (!['published', 'draft'].includes(status)) {
                return next(new AppError('Status must be either "published" or "draft"', 400, true));
            }
            updateData.status = status;
        }

        // Handle image update
        if (file) {
            // Upload new image to Cloudinary
            const { url, public_id } = await uploadImageToCloudinary(file.buffer, 'testimonials');
            updateData.image = { url, public_id };

            // Delete old image from Cloudinary if it exists
            if (testimonial.image?.public_id) {
                await deleteImageFromCloudinary(testimonial.image.public_id);
            }
        }

        // Update testimonial in database
        const updatedTestimonial = await prisma.testimonial.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Testimonials',
            entity: 'Testimonial',
            entityId: id,
            description: `Updated testimonial from: ${updatedTestimonial.name}`,
            metadata: { name: updatedTestimonial.name, role: updatedTestimonial.role, status: updatedTestimonial.status },
        });

        res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully.',
            data: updatedTestimonial,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Delete testimonial by ID with image cleanup
const deleteTestimonialById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find testimonial
        const testimonial = await prisma.testimonial.findUnique({
            where: { id },
        });

        if (!testimonial) {
            return next(new AppError('Testimonial not found', 404, true));
        }

        // Delete image from Cloudinary if exists
        if (testimonial.image?.public_id) {
            await deleteImageFromCloudinary(testimonial.image.public_id);
        }

        // Delete testimonial from database
        await prisma.testimonial.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Testimonials',
            entity: 'Testimonial',
            entityId: id,
            description: `Deleted testimonial from: ${testimonial.name}`,
            metadata: { id, name: testimonial.name, role: testimonial.role },
        });

        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonialById,
    deleteTestimonialById,
};
