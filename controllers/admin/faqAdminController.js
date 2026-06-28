// Admin FAQs controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { logActivity } from '../../utils/activity/logActivity.js';
import { processRichTextImages } from '../../config/cloudinaryUpload.js';

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

        // Process base64 rich-text images if present in answer
        const processedAnswer = await processRichTextImages(answer, 'faqs/answers');

        // Create FAQ in database
        const faq = await prisma.FAQ.create({
            data: {
                question: question.trim(),
                answer: processedAnswer.trim(),
                category: category.trim(),
                status: status || 'draft',
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'FAQs',
            entity: 'FAQ',
            entityId: faq.id,
            description: `Created FAQ: "${faq.question}"`,
            metadata: { question: faq.question, category: faq.category, status: faq.status },
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
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [faqs, total] = await Promise.all([
            prisma.FAQ.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.FAQ.count()
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
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

        const faq = await prisma.FAQ.findUnique({
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
        const faq = await prisma.FAQ.findUnique({
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
            updateData.answer = (await processRichTextImages(answer, 'faqs/answers')).trim();
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
        const updatedFAQ = await prisma.FAQ.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'FAQs',
            entity: 'FAQ',
            entityId: id,
            description: `Updated FAQ: "${updatedFAQ.question}"`,
            metadata: { question: updatedFAQ.question, category: updatedFAQ.category, status: updatedFAQ.status },
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
        const faq = await prisma.FAQ.findUnique({
            where: { id },
        });

        if (!faq) {
            return next(new AppError('FAQ not found', 404, true));
        }

        // Delete FAQ from database
        await prisma.FAQ.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'FAQs',
            entity: 'FAQ',
            entityId: id,
            description: `Deleted FAQ: "${faq.question}"`,
            metadata: { id, question: faq.question },
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
