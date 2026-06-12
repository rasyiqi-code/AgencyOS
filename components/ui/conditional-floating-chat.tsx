"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const FloatingChatWidget = dynamic(
    () => import("./floating-chat").then((mod) => mod.FloatingChatWidget),
    { ssr: false }
);

export function ConditionalFloatingChat() {
    const pathname = usePathname();

    // Jangan tampilkan di halaman admin, pratinjau desain, atau halaman checkout
    const isViewDesign = pathname?.includes("/view-design/");
    const isCheckout = pathname?.includes("/checkout");
    if (pathname?.startsWith("/admin") || isViewDesign || isCheckout) {
        return null;
    }

    return <FloatingChatWidget />;
}
