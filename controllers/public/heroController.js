// Public hero controller - Fetch published hero banners
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get all published hero banners
 */
const getAllHeroes = async (req, res, next) => {
    try {
        const heroes = await prisma.hero.findMany({
            where: {
                status: 'published',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: heroes,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get published hero by ID
 */
const getHeroById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const hero = await prisma.hero.findUnique({
            where: { id },
        });

        if (!hero) {
            return next(new AppError('Hero not found', 404, true));
        }

        // Only return if status is published
        if (hero.status !== 'published') {
            return next(new AppError('Hero not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: hero,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllHeroes, getHeroById };
