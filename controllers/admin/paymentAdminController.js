// Admin Payments controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all payments
const getAllPayments = async (req, res, next) => {
    try {
        const { status, membership_role, year_paid_for, id, memberId, uniqueMemberId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Build filter conditions
        const where = {};

        if (status) {
            const validStatuses = ['pending', 'successful', 'failed'];
            if (!validStatuses.includes(status)) {
                return next(new AppError('Invalid status. Must be one of: pending, successful, failed', 400, true));
            }
            where.status = status;
        }

        if (membership_role) {
            const validRoles = ['standard', 'executive', 'voluntary'];
            if (!validRoles.includes(membership_role)) {
                return next(new AppError('Invalid membership_role. Must be one of: standard, executive, voluntary', 400, true));
            }
            where.membership_role = membership_role;
        }

        if (year_paid_for) {
            const year = parseInt(year_paid_for);
            if (isNaN(year)) {
                return next(new AppError('year_paid_for must be a valid number', 400, true));
            }
            where.year_paid_for = year;
        }

        // Search by Member ID (UUID or 6-digit code)
        if (id || memberId || uniqueMemberId) {
            where.OR = [
                { memberId: (id || memberId)?.trim() },
                { uniqueMemberId: (uniqueMemberId || memberId || id)?.trim() },
                { membership: { memberId: (uniqueMemberId || memberId || id)?.trim() } }
            ].filter(condition => Object.values(condition)[0] !== undefined);
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    membership: {
                        select: {
                            memberId: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.payment.count({ where })
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            data: payments,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get payment by ID
const getPaymentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                membership: true,
            },
        });

        if (!payment) {
            return next(new AppError('Payment not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get all payments for a specific member by their 6-digit Unique ID
 */
const getPaymentsByUniqueMemberId = async (req, res, next) => {
    try {
        const { uniqueMemberId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where: { 
                    OR: [
                        { uniqueMemberId },
                        { membership: { memberId: uniqueMemberId } }
                    ]
                },
                include: {
                    membership: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.payment.count({
                where: {
                    OR: [
                        { uniqueMemberId },
                        { membership: { memberId: uniqueMemberId } }
                    ]
                }
            })
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            data: payments,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllPayments, getPaymentById, getPaymentsByUniqueMemberId };
