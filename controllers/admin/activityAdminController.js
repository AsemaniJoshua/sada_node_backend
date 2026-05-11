// Admin Activity Controller - Query the user activity log
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get all activity logs (admin only)
 * Supports filtering by userId, action, logType, and pagination
 * Resolves the admin's name and email on each log entry
 */
const getAllActivities = async (req, res, next) => {
    try {
        const { userId, action, logType, entity, page = 1, limit = 50 } = req.query;

        // Build filter conditions
        const where = {};

        if (userId) {
            where.userId = userId;
        }

        if (action) {
            const validActions = ['create', 'update', 'delete', 'approve', 'reject'];
            if (!validActions.includes(action)) {
                return next(new AppError(`Invalid action. Must be one of: ${validActions.join(', ')}`, 400, true));
            }
            where.action = action;
        }

        if (logType) {
            const validLogTypes = [
                'Auth', 'Users', 'Blog', 'Gallery', 'Events', 'Projects',
                'Membership', 'Payments', 'Hero', 'Announcements', 'FAQs',
                'Journey', 'Leadership', 'Testimonials', 'Contact', 'Home', 'About',
            ];
            if (!validLogTypes.includes(logType)) {
                return next(new AppError(`Invalid logType. Must be one of: ${validLogTypes.join(', ')}`, 400, true));
            }
            where.logType = logType;
        }

        if (entity) {
            where.entity = entity;
        }

        // Parse pagination
        const parsedPage = Math.max(1, parseInt(page) || 1);
        const parsedLimit = Math.min(200, Math.max(1, parseInt(limit) || 50));
        const skip = (parsedPage - 1) * parsedLimit;

        // Fetch total count and paginated records in parallel
        const [total, activities] = await Promise.all([
            prisma.userActivity.count({ where }),
            prisma.userActivity.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parsedLimit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            image: true,
                        },
                    },
                },
            }),
        ]);

        // Shape the response — flatten user info into each record
        const data = activities.map((activity) => ({
            id: activity.id,
            action: activity.action,
            logType: activity.logType,
            entity: activity.entity,
            entityId: activity.entityId,
            description: activity.description,
            metadata: activity.metadata,
            createdAt: activity.createdAt,
            admin: {
                id: activity.user.id,
                name: activity.user.name,
                email: activity.user.email,
                role: activity.user.role,
                image: activity.user.image,
            },
        }));

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages: Math.ceil(total / parsedLimit),
            },
            data,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get a single activity log entry by ID (admin only)
 */
const getActivityById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const activity = await prisma.userActivity.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        image: true,
                    },
                },
            },
        });

        if (!activity) {
            return next(new AppError('Activity log entry not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: {
                id: activity.id,
                action: activity.action,
                logType: activity.logType,
                entity: activity.entity,
                entityId: activity.entityId,
                description: activity.description,
                metadata: activity.metadata,
                createdAt: activity.createdAt,
                admin: {
                    id: activity.user.id,
                    name: activity.user.name,
                    email: activity.user.email,
                    role: activity.user.role,
                    image: activity.user.image,
                },
            },
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllActivities, getActivityById };
