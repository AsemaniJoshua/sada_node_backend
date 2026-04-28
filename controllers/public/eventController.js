// Public events controller - Fetch upcoming and live events
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get all upcoming and live events
 * Ordered by start_date ascending (earliest first)
 * Supports filtering by event_type
 */
const getAllEvents = async (req, res, next) => {
    try {
        const { event_type } = req.query;

        // Build filter conditions - only upcoming and live events
        const where = {
            status: {
                in: ['upcoming', 'live'],
            },
        };

        if (event_type) {
            where.event_type = event_type;
        }

        // Fetch upcoming and live events ordered by start_date ascending
        const events = await prisma.event.findMany({
            where,
            orderBy: { start_date: 'asc' },
        });

        // Return events data
        res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get upcoming/live event by ID
 */
const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Fetch event by ID
        const event = await prisma.event.findUnique({
            where: { id },
        });

        // Check if event exists and is upcoming or live
        if (!event) {
            throw new AppError('Event not found', 404, true);
        }

        if (event.status !== 'upcoming' && event.status !== 'live') {
            throw new AppError('Event not found', 404, true);
        }

        // Return event data
        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllEvents, getEventById };
