// Admin Payments controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all payments
const getAllPayments = async (req, res, next) => {
    try {
        const { status, membership_role, year_paid_for } = req.query;

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

        const payments = await prisma.payment.findMany({
            where,
            include: {
                membership: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
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

export { getAllPayments, getPaymentById };
