// Public about controller - Fetch about page data
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get about page data
 * Returns the single about record (singleton pattern)
 */
const getAbout = async (req, res, next) => {
    try {
        // Fetch the about record (should be only 1)
        const about = await prisma.about.findFirst();

        // If no about record exists, return error
        if (!about) {
            throw new AppError('About page data not found', 404, true);
        }

        // Return about data
        res.status(200).json({
            success: true,
            data: about,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAbout };
