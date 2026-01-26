"use client";

import { usePathname } from "next/navigation";
import { FloatingChatWidget } from "./floating-chat";

export function ConditionalFloatingChat() {
    const pathname = usePathname();

    // Don't show on admin or full inbox page
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard/inbox")) {
        return null;
    }

    return <FloatingChatWidget />;
}
