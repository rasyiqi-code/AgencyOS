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

    // Jangan tampilkan di halaman admin, inbox lengkap, atau pratinjau desain
    const isViewDesign = pathname?.includes("/view-design/");
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard/inbox") || isViewDesign) {
        return null;
    }

    return <FloatingChatWidget />;
}
