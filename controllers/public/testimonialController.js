// Public testimonials controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all testimonials
const getAllTestimonials = async (req, res, next) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
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

// Get testimonial by ID
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

export { getAllTestimonials, getTestimonialById };
