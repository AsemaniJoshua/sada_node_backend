// Public Payments controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import crypto from 'crypto';

// Create payment and initialize with Paystack
const initiatePayment = async (req, res, next) => {
    try {
        const { memberId, amount, purpose, email } = req.body;

        // Validate required fields
        if (!memberId || !memberId.trim()) {
            return next(new AppError('Member ID is required and cannot be empty', 400, true));
        }

        if (!amount || amount <= 0) {
            return next(new AppError('Amount must be greater than 0', 400, true));
        }

        if (!purpose || !purpose.trim()) {
            return next(new AppError('Purpose is required and cannot be empty', 400, true));
        }

        if (!email || !email.trim()) {
            return next(new AppError('Email is required for payment', 400, true));
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
                amount: baseAmount,
                amountWithFee,
                purpose: purpose.trim(),
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
                metadata: {
                    memberId: memberId.trim(),
                    baseAmount,
                    purpose: purpose.trim(),
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

        if (paystackStatus === 'success') {
            paymentStatus = 'successful';
        } else if (paystackStatus === 'failed') {
            paymentStatus = 'failed';
        }

        // Update payment status in database
        const updatedPayment = await prisma.payment.update({
            where: { reference: reference.trim() },
            data: { status: paymentStatus },
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
                purpose: updatedPayment.purpose,
                memberId: updatedPayment.memberId,
            },
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { initiatePayment, verifyPayment };
