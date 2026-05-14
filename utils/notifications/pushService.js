import webpush from 'web-push';
import { prisma } from '../../config/config.js';

// Configure VAPID keys
// These must be set in your .env file
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@sada.com';

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
    // Attempt push broadcast
    const subscriptions = await prisma.pushSubscription.findMany();
    
    console.log(`[PushService] Broadcasting to ${subscriptions.length} subscribers...`);
    
    if (subscriptions.length === 0) return { total: 0, successful: 0 };

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

/**
 * Send a notification ONLY to admins
 * Used for: New Contact form, New Membership registration, etc.
 */
export const notifyAdmins = async (payload) => {
    // Attempt push notification to admin devices
    const adminSubscriptions = await prisma.pushSubscription.findMany({
        where: {
            user: {
                role: 'admin'
            }
        }
    });

    if (adminSubscriptions.length === 0) {
        console.log('[PushService] No admin subscriptions found for push.');
        return { total: 0, successful: 0 };
    }

    console.log(`[PushService] Notifying ${adminSubscriptions.length} admins...`);
    
    const results = await Promise.allSettled(
        adminSubscriptions.map(sub => sendNotification(sub, payload))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    return {
        total: adminSubscriptions.length,
        successful
    };
};

/**
 * Helper to save notification to database for Admin Inbox
 */
export const saveNotification = async (payload) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                title: payload.title,
                body: payload.body,
                url: payload.url || null,
                icon: payload.icon || null,
                userId: payload.userId || null
            }
        });
        return notification;
    } catch (error) {
        console.error('[PushService] Error saving notification:', error.message);
        return null;
    }
};
