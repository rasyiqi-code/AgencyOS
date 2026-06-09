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
            {/* Header lokal halaman Subscribers */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Mail className="w-6 h-6 text-brand-yellow" />
                    Newsletter Subscribers
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage email list audience subscribed to your newsletter updates.
                </p>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <SubscribersManager />
            </div>
        </div>
    );
}
