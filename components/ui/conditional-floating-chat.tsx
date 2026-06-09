"use client";

import { useLocation } from "@tanstack/react-router";
import { FloatingChatWidget } from "./floating-chat";

export function ConditionalFloatingChat() {
    const pathname = usePathname();

    // Don't show on admin, full inbox page, or view design preview
    const isViewDesign = pathname?.includes("/view-design/");
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard/inbox") || isViewDesign) {
        return null;
    }

    return <FloatingChatWidget />;
}
