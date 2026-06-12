"use client";

import { SubscribersManager } from "@/components/admin/marketing/subscribers-manager";
import { Suspense } from "react";

/**
 * Halaman modul Newsletter Subscribers mandiri.
 */
export default function SubscribersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Subscribers...</div>}>
            <SubscribersContent />
        </Suspense>
    );
}

function SubscribersContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            <div>
                <SubscribersManager />
            </div>
        </div>
    );
}
