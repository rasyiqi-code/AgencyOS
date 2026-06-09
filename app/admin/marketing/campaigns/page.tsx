"use client";

import { PromotionsManager } from "@/components/admin/marketing/promotions-manager";
import { PopUpsManager } from "@/components/admin/marketing/popups-manager";
import { Megaphone, LayoutTemplate } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman sub-modul Campaigns & Promos di bawah Marketing Center.
 */
export default function CampaignsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Campaigns...</div>}>
            <CampaignsContent />
        </Suspense>
    );
}

function CampaignsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Campaigns */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-brand-yellow" />
                    Campaigns & Promos
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage visual promotions and pop-up banner campaigns.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 items-start">
                {/* Bagian Visual Promotions */}
                <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                        <Megaphone className="w-4 h-4 text-brand-yellow" />
                        Visual Promotions
                    </h2>
                    <PromotionsManager />
                </div>

                {/* Bagian PopUp Banners */}
                <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                        <LayoutTemplate className="w-4 h-4 text-brand-yellow" />
                        PopUp Banners
                    </h2>
                    <PopUpsManager />
                </div>
            </div>
        </div>
    );
}
