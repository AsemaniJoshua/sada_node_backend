import { prisma } from '../../config/config.js';
import { AppError } from '../../utils/error/AppError.js';

/**
 * Get all notifications (Admin only)
 */
export const getAllNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, isRead } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (isRead !== undefined) {
            where.isRead = isRead === 'true';
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.notification.count({ where })
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            data: notifications
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification) {
            throw new AppError('Notification not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Mark notification as unread
 */
export const markAsUnread = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.update({
            where: { id },
            data: { isRead: false }
        });

        res.status(200).json({
            success: true,
            message: 'Notification marked as unread',
            data: notification
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        await prisma.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};
