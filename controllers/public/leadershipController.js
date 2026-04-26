// Public Leadership controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all leadership profiles
const getAllLeadership = async (req, res, next) => {
    try {
        const leadership = await prisma.leadership.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: leadership,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get leadership profile by ID
const getLeadershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const leadershipProfile = await prisma.leadership.findUnique({
            where: { id },
        });

        if (!leadershipProfile) {
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
