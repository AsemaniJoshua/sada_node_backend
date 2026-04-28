// Public Announcements controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all published announcements with optional filters
const getAllAnnouncements = async (req, res, next) => {
    try {
        const { priority, start_date_from, start_date_to } = req.query;

        // Build filter conditions - only published and not expired
        const now = new Date();
        const where = {
            status: 'published',
            expiry_date: {
                gt: now, // Only announcements that haven't expired
            },
        };

        // Filter by priority if provided
        if (priority) {
            if (!['low', 'medium', 'high'].includes(priority)) {
                return next(new AppError('Priority must be "low", "medium", or "high"', 400, true));
            }
            where.priority = priority;
        }

        // Filter by date range if provided
        if (start_date_from || start_date_to) {
            where.start_date = {};
            if (start_date_from) {
                const fromDate = new Date(start_date_from);
                if (isNaN(fromDate.getTime())) {
                    return next(new AppError('Invalid start_date_from format', 400, true));
                }
                where.start_date.gte = fromDate;
            }
            if (start_date_to) {
                const toDate = new Date(start_date_to);
                if (isNaN(toDate.getTime())) {
                    return next(new AppError('Invalid start_date_to format', 400, true));
                }
                where.start_date.lte = toDate;
            }
        }

        const announcements = await prisma.announcement.findMany({
            where,
            orderBy: {
                start_date: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: announcements,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get published announcement by ID
const getAnnouncementById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const now = new Date();

        const announcement = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!announcement) {
            return next(new AppError('Announcement not found', 404, true));
        }

        // Only return if published and not expired
        if (announcement.status !== 'published') {
            return next(new AppError('Announcement not found', 404, true));
        }

        if (announcement.expiry_date <= now) {
            return next(new AppError('Announcement not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: announcement,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllAnnouncements, getAnnouncementById };
