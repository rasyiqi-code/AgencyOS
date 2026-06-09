"use client";

import { PushManager } from "@/components/admin/marketing/push-manager";
import { Bell } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman sub-modul Push Center di bawah Marketing Center.
 */
export default function PushCenterPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Push Center...</div>}>
            <PushCenterContent />
        </Suspense>
    );
}

function PushCenterContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Push */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Bell className="w-6 h-6 text-brand-yellow" />
                    Push Notification Center
                </h1>
                <p className="text-zinc-400 mt-1">
                    Compose and dispatch web push notifications to your active client audience.
                </p>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                {/* Judul lokal bagian Push Notification */}
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                    <Bell className="w-4 h-4 text-brand-yellow" />
                    Push Notification Center
                </h2>
                <PushManager />
            </div>
        </div>
    );
}
