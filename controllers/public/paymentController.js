// Public Payments controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import crypto from 'crypto';

// Create payment and initialize with Paystack
const initiatePayment = async (req, res, next) => {
    try {
        const { memberId, full_name, email, membership_role, month_paid_for, year_paid_for, amount, payment_method } = req.body;

        // Validate required fields
        if (!memberId || !memberId.trim()) {
            return next(new AppError('Member ID is required and cannot be empty', 400, true));
        }

        if (!full_name || !full_name.trim()) {
            return next(new AppError('Full name is required and cannot be empty', 400, true));
        }

        if (!email || !email.trim()) {
            return next(new AppError('Email is required for payment', 400, true));
        }

        // Validate membership role
        const validRoles = ['standard', 'executive', 'voluntary'];
        if (!membership_role || !validRoles.includes(membership_role)) {
            return next(new AppError('membership_role is required. Must be one of: standard, executive, voluntary', 400, true));
        }

        // Validate month_paid_for
        if (!month_paid_for || month_paid_for < 1 || month_paid_for > 12) {
            return next(new AppError('month_paid_for is required and must be between 1 and 12', 400, true));
        }

        // Validate year_paid_for
        if (!year_paid_for || typeof year_paid_for !== 'number' || year_paid_for < 2000) {
            return next(new AppError('year_paid_for is required and must be a valid year', 400, true));
        }

        if (!amount || amount <= 0) {
            return next(new AppError('Amount must be greater than 0', 400, true));
        }

        // Verify membership exists
        const membership = await prisma.membership.findUnique({
            where: { id: memberId.trim() },
        });

        if (!membership) {
            return next(new AppError('Membership not found', 404, true));
        }

        // Calculate amount with 1% fee (in Ghana Cedis)
        const baseAmount = parseFloat(amount);
        const feeAmount = baseAmount * 0.01;
        const amountWithFee = baseAmount + feeAmount;

        // Convert to pesewas (subunit: 1 GHS = 100 pesewas)
        const amountInPesewas = Math.round(amountWithFee * 100);

        // Generate unique reference
        const reference = `SADA_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Create payment record in database
        const payment = await prisma.payment.create({
            data: {
                memberId: memberId.trim(),
                full_name: full_name.trim(),
                email: email.trim(),
                membership_role,
                month_paid_for,
                year_paid_for,
                amount: baseAmount,
                amountWithFee,
                payment_method: payment_method || null,
                status: 'pending',
                reference,
            },
        });

        // Initialize transaction with Paystack
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim(),
                amount: amountInPesewas,
                reference,
                callback_url: process.env.PAYSTACK_CALLBACK_URL,
                metadata: {
                    memberId: memberId.trim(),
                    full_name: full_name.trim(),
                    membership_role,
                    month_paid_for,
                    year_paid_for,
                    baseAmount,
                },
            }),
        });

        if (!paystackResponse.ok) {
            // Delete payment record if Paystack initialization fails
            await prisma.payment.delete({ where: { id: payment.id } });
            return next(new AppError('Failed to initialize payment with Paystack', 500, true));
        }

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            // Delete payment record if Paystack returns an error
            await prisma.payment.delete({ where: { id: payment.id } });
            return next(new AppError(paystackData.message || 'Failed to initialize payment', 400, true));
        }

        res.status(200).json({
            success: true,
            message: 'Payment initialized successfully.',
            data: {
                paymentId: payment.id,
                reference,
                authorizationUrl: paystackData.data.authorization_url,
                accessCode: paystackData.data.access_code,
            },
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Verify payment with Paystack
const verifyPayment = async (req, res, next) => {
    try {
        const { reference } = req.params;

        // Validate reference
        if (!reference || !reference.trim()) {
            return next(new AppError('Reference is required', 400, true));
        }

        // Find payment record
        const payment = await prisma.payment.findUnique({
            where: { reference: reference.trim() },
            include: {
                membership: true,
            },
        });

        if (!payment) {
            return next(new AppError('Payment not found', 404, true));
        }

        // Verify with Paystack
        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference.trim()}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        if (!verifyResponse.ok) {
            return next(new AppError('Failed to verify payment with Paystack', 500, true));
        }

        const verifyData = await verifyResponse.json();

        if (!verifyData.status) {
            return next(new AppError(verifyData.message || 'Failed to verify payment', 400, true));
        }

        // Extract status from Paystack response
        const paystackStatus = verifyData.data.status;
        let paymentStatus = 'pending';
        let paymentMethod = payment.payment_method;

        if (paystackStatus === 'success') {
            paymentStatus = 'successful';
        } else if (paystackStatus === 'failed') {
            paymentStatus = 'failed';
        }

        // Extract payment method from Paystack response if available
        if (verifyData.data.authorization && verifyData.data.authorization.channel) {
            paymentMethod = verifyData.data.authorization.channel;
        }

        // Update payment status and payment method in database
        const updatedPayment = await prisma.payment.update({
            where: { reference: reference.trim() },
            data: { 
                status: paymentStatus,
                payment_method: paymentMethod,
            },
            include: {
                membership: true,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully.',
            data: {
                paymentId: updatedPayment.id,
                reference: updatedPayment.reference,
                status: updatedPayment.status,
                amount: updatedPayment.amount,
                amountWithFee: updatedPayment.amountWithFee,
                full_name: updatedPayment.full_name,
                email: updatedPayment.email,
                membership_role: updatedPayment.membership_role,
                month_paid_for: updatedPayment.month_paid_for,
                year_paid_for: updatedPayment.year_paid_for,
                payment_method: updatedPayment.payment_method,
                memberId: updatedPayment.memberId,
            },
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { initiatePayment, verifyPayment };
