// Admin FAQs controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Create new FAQ
const createFAQ = async (req, res, next) => {
    try {
        const { question, answer, category, status } = req.body;

        // Validate required fields
        if (!question || !question.trim()) {
            return next(new AppError('Question is required and cannot be empty', 400, true));
        }

        if (!answer || !answer.trim()) {
            return next(new AppError('Answer is required and cannot be empty', 400, true));
        }

        if (!category || !category.trim()) {
            return next(new AppError('Category is required and cannot be empty', 400, true));
        }

        // Validate status if provided
        if (status && !['published', 'draft'].includes(status)) {
            return next(new AppError('Status must be either "published" or "draft"', 400, true));
        }

        // Create FAQ in database
        const faq = await prisma.faq.create({
            data: {
                question: question.trim(),
                answer: answer.trim(),
                category: category.trim(),
                status: status || 'draft',
            },
        });

        res.status(201).json({
            success: true,
            message: 'FAQ created successfully.',
            data: faq,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get all FAQs (admin view)
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

// Get FAQ by ID (admin view)
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

// Update FAQ by ID
const updateFAQById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { question, answer, category, status } = req.body;

        // Find existing FAQ
        const faq = await prisma.faq.findUnique({
            where: { id },
        });

        if (!faq) {
            return next(new AppError('FAQ not found', 404, true));
        }

        // Prepare update data
        const updateData = {};

        // Update question if provided
        if (question) {
            if (!question.trim()) {
                return next(new AppError('Question cannot be empty', 400, true));
            }
            updateData.question = question.trim();
        }

        // Update answer if provided
        if (answer) {
            if (!answer.trim()) {
                return next(new AppError('Answer cannot be empty', 400, true));
            }
            updateData.answer = answer.trim();
        }

        // Update category if provided
        if (category) {
            if (!category.trim()) {
                return next(new AppError('Category cannot be empty', 400, true));
            }
            updateData.category = category.trim();
        }

        // Update status if provided
        if (status) {
            if (!['published', 'draft'].includes(status)) {
                return next(new AppError('Status must be either "published" or "draft"', 400, true));
            }
            updateData.status = status;
        }

        // Update FAQ in database
        const updatedFAQ = await prisma.faq.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'FAQ updated successfully.',
            data: updatedFAQ,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Delete FAQ by ID
const deleteFAQById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find FAQ
        const faq = await prisma.faq.findUnique({
            where: { id },
        });

        if (!faq) {
            return next(new AppError('FAQ not found', 404, true));
        }

        // Delete FAQ from database
        await prisma.faq.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'FAQ deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createFAQ,
    getAllFAQs,
    getFAQById,
    updateFAQById,
    deleteFAQById,
};
