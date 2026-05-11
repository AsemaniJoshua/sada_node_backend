import { prisma } from '../../config/config.js';
import { AppError } from '../../utils/error/AppError.js';

/**
 * Subscribe to push notifications
 * Expects { endpoint, keys: { p256dh, auth } }
 */
export const subscribe = async (req, res, next) => {
    try {
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            throw new AppError('Invalid subscription data provided', 400, true);
        }

        // Create or update subscription
        // We use upsert so if a browser refreshes its subscription, we don't create duplicates
        const subscription = await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                p256dh: keys.p256dh,
                auth: keys.auth,
                userId: req.user?.userId || null // Link to user if logged in
            },
            create: {
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                userId: req.user?.userId || null
            }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to push notifications',
            data: subscription
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribe = async (req, res, next) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            throw new AppError('Endpoint is required to unsubscribe', 400, true);
        }

        await prisma.pushSubscription.deleteMany({
            where: { endpoint }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from push notifications'
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};
