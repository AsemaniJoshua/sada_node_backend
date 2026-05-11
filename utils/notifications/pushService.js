import webpush from 'web-push';
import { prisma } from '../../config/config.js';

// Configure VAPID keys
// These must be set in your .env file
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:example@yourdomain.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_EMAIL,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

/**
 * Send a notification to a specific subscription
 * @param {Object} subscription - The subscription object from DB
 * @param {Object} payload - Notification payload { title, body, icon, url, etc. }
 */
export const sendNotification = async (subscription, payload) => {
    try {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        return { success: true };
    } catch (error) {
        // If the subscription is no longer valid (status 404 or 410), remove it
        if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(`[PushService] Removing stale subscription: ${subscription.id}`);
            await prisma.pushSubscription.delete({ where: { id: subscription.id } });
        } else {
            console.error(`[PushService] Error sending to ${subscription.id}:`, error.message);
        }
        return { success: false, error: error.message };
    }
};

/**
 * Broadcast a notification to all subscribers
 * @param {Object} payload - Notification payload { title, body, icon, url, etc. }
 */
export const broadcastNotification = async (payload) => {
    const subscriptions = await prisma.pushSubscription.findMany();
    
    console.log(`[PushService] Broadcasting to ${subscriptions.length} subscribers...`);
    
    const results = await Promise.allSettled(
        subscriptions.map(sub => sendNotification(sub, payload))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`[PushService] Broadcast complete. Success: ${successful}/${subscriptions.length}`);
    
    return {
        total: subscriptions.length,
        successful
    };
};
