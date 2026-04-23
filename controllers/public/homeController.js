// Public home controller - Fetch home page data
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get home page data
 * Returns the single home record (singleton pattern)
 */
const getHome = async (req, res, next) => {
    try {
        // Fetch the home record (should be only 1)
        const home = await prisma.home.findFirst();

        // If no home record exists, return empty response
        if (!home) {
            throw new AppError('Home page data not found', 404, true);
        }

        // Return home data
        res.status(200).json({
            success: true,
            data: home,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getHome };
