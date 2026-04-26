// Public Journey controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all journey milestones
const getAllJourneys = async (req, res, next) => {
    try {
        const journeys = await prisma.journey.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: journeys,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get journey milestone by ID
const getJourneyById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const journey = await prisma.journey.findUnique({
            where: { id },
        });

        if (!journey) {
            return next(new AppError('Journey milestone not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: journey,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllJourneys, getJourneyById };
