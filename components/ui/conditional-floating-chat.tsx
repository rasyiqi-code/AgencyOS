"use client";

import { usePathname } from "next/navigation";
import { FloatingChatWidget } from "./floating-chat";
import { useState, useEffect } from "react";

export function ConditionalFloatingChat() {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    // Pastikan komponen hanya ter-render di client-side untuk menghindari mismatch hidrasi
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // Jangan tampilkan di halaman admin, inbox lengkap, pratinjau desain, atau halaman checkout
    const isViewDesign = pathname?.includes("/view-design/");
    const isCheckout = pathname?.startsWith("/checkout");
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard/inbox") || isViewDesign || isCheckout) {
        return null;
    }

    return <FloatingChatWidget />;
}
