// Public Announcements controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all announcements
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

// Get announcement by ID
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

export { getAllAnnouncements, getAnnouncementById };
