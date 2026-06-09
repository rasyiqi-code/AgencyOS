"use client";

import { PromotionsManager } from "@/components/admin/marketing/promotions-manager";
import { Megaphone } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman modul Visual Promotions mandiri.
 */
export default function PromotionsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Promotions...</div>}>
            <PromotionsContent />
        </Suspense>
    );
}

function PromotionsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Promotions */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-brand-yellow" />
                    Visual Promotions
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage visual marketing promotions and banner configurations.
                </p>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <PromotionsManager />
            </div>
        </div>
    );
}
