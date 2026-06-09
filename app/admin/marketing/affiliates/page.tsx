"use client";

import { AffiliateManager } from "@/components/admin/marketing/affiliate-manager";
import { Users } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman modul Affiliate Partners mandiri.
 */
export default function AffiliatesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Affiliate Console...</div>}>
            <AffiliatesContent />
        </Suspense>
    );
}

function AffiliatesContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Affiliates */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-brand-yellow" />
                    Affiliate Partners
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage registered affiliate partners, commission rates, and tracking links.
                </p>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <AffiliateManager />
            </div>
        </div>
    );
}
