"use client";

import { SubscribersManager } from "@/components/admin/marketing/subscribers-manager";
import { Mail } from "lucide-react";
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
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <SubscribersManager />
            </div>
        </div>
    );
}
