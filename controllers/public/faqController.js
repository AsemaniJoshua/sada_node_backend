// Public FAQs controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all FAQs
const getAllFAQs = async (req, res, next) => {
    try {
        const faqs = await prisma.faq.findMany({
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

// Get FAQ by ID
const getFAQById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const faq = await prisma.faq.findUnique({
            where: { id },
        });

        if (!faq) {
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
