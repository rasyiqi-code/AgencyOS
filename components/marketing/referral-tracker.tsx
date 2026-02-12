"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get("ref") || searchParams.get("affiliate");
        const source = searchParams.get("source");

        if (refCode) {
            // Check if already tracked in this session to avoid spamming API on simple navigations
            const sessionKey = `referral_tracked_${refCode}`;
            if (sessionStorage.getItem(sessionKey)) return;

            // Generate a simple fingerprint or just use null
            const visitorId = localStorage.getItem("visitor_id") || Math.random().toString(36).substring(2);
            localStorage.setItem("visitor_id", visitorId);

            fetch("/api/marketing/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: refCode, source, visitorId }),
            })
                .then(res => {
                    if (res.ok) {
                        sessionStorage.setItem(sessionKey, "true");
                    }
                })
                .catch(err => console.error("Tracking error", err));
        }
    }, [searchParams]);

    return null;
}
