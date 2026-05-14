import { prisma } from '../../config/config.js';
import { AppError } from '../../utils/error/AppError.js';

/**
 * Get all communication logs (Admin only)
 */
export const getAllCommunicationLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, type } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (type) {
            where.type = type;
        }

        const [logs, total] = await Promise.all([
            prisma.communicationLog.findMany({
                where,
                include: {
                    admin: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.communicationLog.count({ where })
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            data: logs
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get communication log by ID
 */
export const getCommunicationLogById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const log = await prisma.communicationLog.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!log) {
            throw new AppError('Communication log not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Delete communication log by ID
 */
export const deleteCommunicationLogById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if exists
        const log = await prisma.communicationLog.findUnique({
            where: { id }
        });

        if (!log) {
            throw new AppError('Communication log not found', 404, true);
        }

        await prisma.communicationLog.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: 'Communication history record deleted successfully'
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};
