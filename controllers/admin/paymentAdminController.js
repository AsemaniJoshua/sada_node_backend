// Admin Payments controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { logActivity } from '../../utils/activity/logActivity.js';

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

/**
 * Admin create a manual payment (e.g. for physical cash collected)
 */
const createPayment = async (req, res, next) => {
    try {
        const { memberId, amount, month_paid_for, year_paid_for, membership_role, payment_method, notes } = req.body;

        // Validate required fields
        if (!memberId || !amount || !month_paid_for || !year_paid_for || !membership_role) {
            return next(new AppError('memberId, amount, month_paid_for, year_paid_for, and membership_role are required', 400, true));
        }

        const validRoles = ['standard', 'executive', 'voluntary'];
        if (!validRoles.includes(membership_role)) {
            return next(new AppError('Invalid membership_role. Must be one of: standard, executive, voluntary', 400, true));
        }

        const month = parseInt(month_paid_for);
        const year = parseInt(year_paid_for);

        if (isNaN(month) || month < 1 || month > 12) {
            return next(new AppError('month_paid_for must be between 1 and 12', 400, true));
        }

        if (isNaN(year)) {
            return next(new AppError('year_paid_for must be a valid year', 400, true));
        }

        // Find member by ID (either the UUID or the 6-digit unique member ID)
        const member = await prisma.membership.findFirst({
            where: {
                OR: [
                    { id: memberId },
                    { memberId: memberId }
                ]
            }
        });

        if (!member) {
            return next(new AppError('Membership not found with the provided ID', 404, true));
        }

        // checking if the member is approved
        if (member.status !== 'approved') {
            return next(new AppError(`Payments can only be made for members with an approved status.`, 403, true));
        }

        // Generate unique reference
        const reference = `MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const amountNum = parseFloat(amount);

        const payment = await prisma.payment.create({
            data: {
                membership: {
                    connect: { id: member.id }
                },
                uniqueMemberId: member.memberId,
                full_name: `${member.firstName} ${member.lastName}`,
                email: member.email,
                membership_role: membership_role,
                month_paid_for: month,
                year_paid_for: year,
                amount: amountNum,
                amountWithFee: amountNum, // No fee for manual entry
                payment_method: payment_method || 'cash',
                status: 'successful',
                reference: reference
            }
        });

        // Log the activity if req.user exists
        if (req.user && req.user.userId) {
            await logActivity({
                userId: req.user.userId,
                action: 'create',
                logType: 'Payments',
                entity: 'Payment',
                entityId: payment.id,
                description: `Manual payment created for ${member.firstName} ${member.lastName} (${amount})`,
                metadata: { memberId: member.id, uniqueMemberId: member.memberId, amount: amount, role: membership_role }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: payment
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllPayments, getPaymentById, getPaymentsByUniqueMemberId, createPayment };
