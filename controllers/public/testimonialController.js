// Public testimonials controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all published testimonials
const getAllTestimonials = async (req, res, next) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: {
                status: 'published',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: testimonials,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get published testimonial by ID
const getTestimonialById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const testimonial = await prisma.testimonial.findUnique({
            where: { id },
        });

        if (!testimonial) {
            return next(new AppError('Testimonial not found', 404, true));
        }

        // Only return if status is published
        if (testimonial.status !== 'published') {
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

export { getAllTestimonials, getTestimonialById };
