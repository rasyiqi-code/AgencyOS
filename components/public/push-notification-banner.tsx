"use client";

import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function PushNotificationBanner() {
    console.log("PushNotificationBanner initialized");
    const { isSupported, isSubscribed, permission, subscribe } = usePushNotifications();

    useEffect(() => {
        // Only trigger if supported, not subscribed, and permission is not denied
        if (isSupported && !isSubscribed && permission !== "denied") {
            const shown = localStorage.getItem("push_prompt_triggered");
            const lastShown = shown ? parseInt(shown) : 0;
            const now = Date.now();

            // Trigger after 15 seconds, and once every 7 days if ignored/dismissed
            // We use a longer interval for native prompts to be less intrusive
            if (now - lastShown > 1000 * 60 * 60 * 24 * 7) {
                const timer = setTimeout(async () => {
                    try {
                        await subscribe();
                        localStorage.setItem("push_prompt_triggered", Date.now().toString());
                    } catch (error) {
                        console.error("Failed to trigger auto-subscribe:", error);
                    }
                }, 15000);
                return () => clearTimeout(timer);
            }
        }
    }, [isSupported, isSubscribed, permission, subscribe]);

    return null;
}
