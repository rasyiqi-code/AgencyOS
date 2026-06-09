"use client";

import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

export function ScrollRestorer() {
    const pathname = usePathname();

    useEffect(() => {
        // Function to handle scroll and save position
        const handleScroll = () => {
            // Debounce or throttle could be added here if needed for performance
            // but sessionStorage is fast enough for basic usage
            sessionStorage.setItem(`scroll-pos-${pathname}`, window.scrollY.toString());
        };

        window.addEventListener("scroll", handleScroll);

        // Restore scroll position on mount
        const savedPos = sessionStorage.getItem(`scroll-pos-${pathname}`);
        if (savedPos) {
            const targetPos = parseInt(savedPos);
            
            // Wait for next frame to ensure rendering has started
            const restoreScroll = () => {
                if (window.scrollY !== targetPos) {
                    window.scrollTo(0, targetPos);
                }
            };

            // Try multiple times to handle dynamic content loading
            const frame1 = requestAnimationFrame(restoreScroll);
            const frame2 = requestAnimationFrame(() => {
                setTimeout(restoreScroll, 100);
            });
            const frame3 = requestAnimationFrame(() => {
                setTimeout(restoreScroll, 500);
            });

            return () => {
                cancelAnimationFrame(frame1);
                cancelAnimationFrame(frame2);
                cancelAnimationFrame(frame3);
                window.removeEventListener("scroll", handleScroll);
            };
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [pathname]);

    return null;
}
