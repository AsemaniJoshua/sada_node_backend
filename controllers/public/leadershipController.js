// Public Leadership controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all published leadership profiles
const getAllLeadership = async (req, res, next) => {
    try {
        const leadership = await prisma.leadership.findMany({
            where: {
                status: 'published',
            },
            orderBy: [
                { sort_order: { sort: 'asc', nulls: 'last' } },
                { createdAt: 'desc' }
            ],
        });

        res.status(200).json({
            success: true,
            data: leadership,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get published leadership profile by ID
const getLeadershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const leadershipProfile = await prisma.leadership.findUnique({
            where: { id },
        });

        if (!leadershipProfile) {
            return next(new AppError('Leadership profile not found', 404, true));
        }

        // Only return if status is published
        if (leadershipProfile.status !== 'published') {
            return next(new AppError('Leadership profile not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: leadershipProfile,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllLeadership, getLeadershipById };
