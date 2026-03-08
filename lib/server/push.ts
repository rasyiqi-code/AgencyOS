import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@crediblemark.com';

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('Web Push VAPID keys are not set. Push notifications will not work.');
} else {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

export interface PushMessagePayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    data?: Record<string, unknown>;
}

export async function sendPushNotification(
    subscription: webpush.PushSubscription,
    payload: PushMessagePayload
) {
    try {
        const pushPayload = JSON.stringify({
            ...payload,
            icon: payload.icon || '/icon-192x192.png',
            badge: payload.badge || '/badge-72x72.png',
        });

        await webpush.sendNotification(subscription, pushPayload);
        return { success: true };
    } catch (error: unknown) {
        const pushError = error as { statusCode?: number };
        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
            // Subscription has expired or is no longer valid
            return { success: false, expired: true, error };
        }
        console.error('Error sending push notification:', error);
        return { success: false, error };
    }
}

export async function broadcastPushNotification(
    subscriptions: webpush.PushSubscription[],
    payload: PushMessagePayload
) {
    const results = await Promise.all(
        subscriptions.map((sub) => sendPushNotification(sub, payload))
    );

    const successful = results.filter((r) => r.success).length;
    const expired = results.filter((r) => r.expired).length;
    const failed = results.length - successful - expired;

    return {
        total: subscriptions.length,
        successful,
        expired,
        failed,
    };
}
