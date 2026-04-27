// Public membership controller - Read operations for membership
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get all membership records
 * For singleton, should return array with 1 record
 */
const getAllMemberships = async (req, res, next) => {
    try {
        const memberships = await prisma.membership.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: memberships,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get membership record by ID
 */
const getMembershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        const membership = await prisma.membership.findUnique({
            where: { id },
        });

        if (!membership) {
            throw new AppError('Membership record not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: membership,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    getAllMemberships,
    getMembershipById,
};
