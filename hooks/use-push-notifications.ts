'use client';

import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>(() =>
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
    );
    const [isSupported] = useState(() =>
        typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (isSupported) {
            // Check for existing registration
            navigator.serviceWorker.ready.then((reg) => {
                setRegistration(reg);
                reg.pushManager.getSubscription().then((sub) => {
                    setIsSubscribed(!!sub);
                });
            });
        }
    }, [isSupported]);

    const subscribe = useCallback(async () => {
        if (!registration || !VAPID_PUBLIC_KEY) return null;

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // Send to server
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: sub,
                    metadata: {
                        userAgent: navigator.userAgent,
                        language: navigator.language,
                    },
                }),
            });

            if (response.ok) {
                setIsSubscribed(true);
                setPermission(Notification.permission);
                return sub;
            }
            return null;
        } catch (error) {
            console.error('Subscription error:', error);
            return null;
        }
    }, [registration]);

    const unsubscribe = useCallback(async () => {
        if (!registration) return false;

        try {
            const sub = await registration.pushManager.getSubscription();
            if (sub) {
                await sub.unsubscribe();

                // Notify server
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });

                setIsSubscribed(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Unsubscription error:', error);
            return false;
        }
    }, [registration]);

    return {
        permission,
        isSupported,
        isSubscribed,
        subscribe,
        unsubscribe,
    };
}

// Helper function
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
