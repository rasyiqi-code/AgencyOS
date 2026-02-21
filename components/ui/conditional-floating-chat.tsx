"use client";

import { usePathname } from "next/navigation";
import { FloatingChatWidget } from "./floating-chat";

export function ConditionalFloatingChat() {
    const pathname = usePathname();

    // Don't show on admin, full inbox page, or product detail page
    if (
        pathname?.startsWith("/admin") ||
        pathname?.startsWith("/dashboard/inbox") ||
        pathname?.includes("/products/")
    ) {
        return null;
    }

    return <FloatingChatWidget />;
}
