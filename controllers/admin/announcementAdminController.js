// Admin Announcements controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { logActivity } from '../../utils/activity/logActivity.js';
import { broadcastNotification } from '../../utils/notifications/pushService.js';

// Create new announcement
const createAnnouncement = async (req, res, next) => {
    try {
        const { title, content, priority, status, start_date, expiry_date } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return next(new AppError('Title is required and cannot be empty', 400, true));
        }

        if (!content || !content.trim()) {
            return next(new AppError('Content is required and cannot be empty', 400, true));
        }

        if (!start_date) {
            return next(new AppError('Start date is required', 400, true));
        }

        if (!expiry_date) {
            return next(new AppError('Expiry date is required', 400, true));
        }

        // Validate dates
        const startDate = new Date(start_date);
        const expiryDate = new Date(expiry_date);

        if (isNaN(startDate.getTime()) || isNaN(expiryDate.getTime())) {
            return next(new AppError('Invalid date format', 400, true));
        }

        if (expiryDate <= startDate) {
            return next(new AppError('Expiry date must be after start date', 400, true));
        }

        // Validate priority if provided
        if (priority && !['low', 'medium', 'high'].includes(priority)) {
            return next(new AppError('Priority must be "low", "medium", or "high"', 400, true));
        }

        // Validate status if provided
        if (status && !['draft', 'published'].includes(status)) {
            return next(new AppError('Status must be "draft" or "published"', 400, true));
        }

        // Create announcement in database
        const announcement = await prisma.announcement.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                priority: priority || 'low',
                status: status || 'draft',
                start_date: startDate,
                expiry_date: expiryDate,
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Announcements',
            entity: 'Announcement',
            entityId: announcement.id,
            description: `Created announcement: "${announcement.title}"`,
            metadata: { title: announcement.title, priority: announcement.priority, status: announcement.status },
        });

        // Send push notification
        if (announcement.status === 'published') {
            broadcastNotification({
                title: 'New Announcement!',
                body: announcement.title,
                url: `/announcements/${announcement.id}`
            });
        }

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully.',
            data: announcement,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get all announcements (admin view) with optional filters
const getAllAnnouncements = async (req, res, next) => {
    try {
        const { priority, status, start_date_from, start_date_to } = req.query;

        // Build filter conditions
        const where = {};

        if (priority) {
            if (!['low', 'medium', 'high'].includes(priority)) {
                return next(new AppError('Priority must be "low", "medium", or "high"', 400, true));
            }
            where.priority = priority;
        }

        if (status) {
            if (!['draft', 'published'].includes(status)) {
                return next(new AppError('Status must be "draft" or "published"', 400, true));
            }
            where.status = status;
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

// Get announcement by ID (admin view)
const getAnnouncementById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const announcement = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!announcement) {
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

// Update announcement by ID
const updateAnnouncementById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, priority, status, start_date, expiry_date } = req.body;

        // Find existing announcement
        const announcement = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!announcement) {
            return next(new AppError('Announcement not found', 404, true));
        }

        // Prepare update data
        const updateData = {};

        // Update title if provided
        if (title) {
            if (!title.trim()) {
                return next(new AppError('Title cannot be empty', 400, true));
            }
            updateData.title = title.trim();
        }

        // Update content if provided
        if (content) {
            if (!content.trim()) {
                return next(new AppError('Content cannot be empty', 400, true));
            }
            updateData.content = content.trim();
        }

        // Update priority if provided
        if (priority) {
            if (!['low', 'medium', 'high'].includes(priority)) {
                return next(new AppError('Priority must be "low", "medium", or "high"', 400, true));
            }
            updateData.priority = priority;
        }

        // Update status if provided
        if (status) {
            if (!['draft', 'published'].includes(status)) {
                return next(new AppError('Status must be "draft" or "published"', 400, true));
            }
            updateData.status = status;
        }

        // Update start_date if provided
        if (start_date) {
            const startDate = new Date(start_date);
            if (isNaN(startDate.getTime())) {
                return next(new AppError('Invalid start_date format', 400, true));
            }
            updateData.start_date = startDate;
        }

        // Update expiry_date if provided
        if (expiry_date) {
            const expiryDate = new Date(expiry_date);
            if (isNaN(expiryDate.getTime())) {
                return next(new AppError('Invalid expiry_date format', 400, true));
            }
            updateData.expiry_date = expiryDate;
        }

        // Validate that expiry_date is after start_date
        const finalStartDate = updateData.start_date || announcement.start_date;
        const finalExpiryDate = updateData.expiry_date || announcement.expiry_date;
        if (finalExpiryDate <= finalStartDate) {
            return next(new AppError('Expiry date must be after start date', 400, true));
        }

        // Update announcement in database
        const updatedAnnouncement = await prisma.announcement.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Announcements',
            entity: 'Announcement',
            entityId: id,
            description: `Updated announcement: "${updatedAnnouncement.title}"`,
            metadata: updateData,
        });

        // Smart Notification: Only notify if it was NOT published before, but is NOW published
        if (existingAnnouncement.status !== 'published' && updatedAnnouncement.status === 'published') {
            broadcastNotification({
                title: 'New Announcement!',
                body: updatedAnnouncement.title,
                url: `/announcements/${updatedAnnouncement.id}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Announcement updated successfully.',
            data: updatedAnnouncement,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Delete announcement by ID
const deleteAnnouncementById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find announcement
        const announcement = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!announcement) {
            return next(new AppError('Announcement not found', 404, true));
        }

        // Delete announcement from database
        await prisma.announcement.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Announcements',
            entity: 'Announcement',
            entityId: id,
            description: `Deleted announcement: "${announcement.title}"`,
            metadata: { id, title: announcement.title },
        });

        res.status(200).json({
            success: true,
            message: 'Announcement deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncementById,
    deleteAnnouncementById,
};
