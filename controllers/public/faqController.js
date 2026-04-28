// Public FAQs controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all published FAQs
const getAllFAQs = async (req, res, next) => {
    try {
        const faqs = await prisma.FAQ.findMany({
            where: {
                status: 'published',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: faqs,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get published FAQ by ID
const getFAQById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const faq = await prisma.FAQ.findUnique({
            where: { id },
        });

        if (!faq) {
            return next(new AppError('FAQ not found', 404, true));
        }

        // Only return if status is published
        if (faq.status !== 'published') {
            return next(new AppError('FAQ not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: faq,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllFAQs, getFAQById };
