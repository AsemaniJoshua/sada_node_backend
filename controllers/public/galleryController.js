// Public gallery controller
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/error/AppError.js';

const prisma = new PrismaClient();

// Get all gallery images
const getAllGalleries = async (req, res, next) => {
    try {
        const galleries = await prisma.gallery.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: galleries,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get gallery by ID
const getGalleryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const gallery = await prisma.gallery.findUnique({
            where: { id },
        });

        if (!gallery) {
            return next(new AppError('Gallery not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: gallery,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllGalleries, getGalleryById };
