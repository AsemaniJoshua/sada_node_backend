// Admin Payments controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get all payments
const getAllPayments = async (req, res, next) => {
    try {
        const payments = await prisma.payment.findMany({
            orderBy: {
                date: 'desc',
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
