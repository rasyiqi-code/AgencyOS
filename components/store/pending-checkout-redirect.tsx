"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function PendingCheckoutRedirect() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only run on homepage
        if (pathname === '/') {
            const pendingServiceId = sessionStorage.getItem('pendingServiceCheckout');
            if (pendingServiceId) {
                // Don't remove yet, let the services page handle it
                router.push('/services?action=checkout');
            }
        }
    }, [pathname, router]);

    return null;
}
