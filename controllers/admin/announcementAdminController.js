// Admin Announcements controller with CRUD operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Create new announcement
const createAnnouncement = async (req, res, next) => {
    try {
        const { title, content, date } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return next(new AppError('Title is required and cannot be empty', 400, true));
        }

        if (!content || !content.trim()) {
            return next(new AppError('Content is required and cannot be empty', 400, true));
        }

        // Validate and parse date if provided
        let announcementDate = new Date();
        if (date) {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return next(new AppError('Invalid date format', 400, true));
            }
            // Validate that date is in the future
            if (parsedDate <= new Date()) {
                return next(new AppError('Announcement date must be in the future', 400, true));
            }
            announcementDate = parsedDate;
        }

        // Create announcement in database
        const announcement = await prisma.announcement.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                date: announcementDate,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully.',
            data: announcement,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get all announcements (admin view)
const getAllAnnouncements = async (req, res, next) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: {
                date: 'desc',
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
        const { title, content } = req.body;

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

        // Update date if provided
        if (date) {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return next(new AppError('Invalid date format', 400, true));
            }
            updateData.date = parsedDate;
        }

        // Update announcement in database
        const updatedAnnouncement = await prisma.announcement.update({
            where: { id },
            data: updateData,
        });

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
