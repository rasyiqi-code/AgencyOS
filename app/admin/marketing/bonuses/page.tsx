"use client";

import { BonusesManager } from "@/components/admin/marketing/bonuses-manager";
import { Gift } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman modul Checkout Bonuses mandiri.
 */
export default function BonusesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Bonuses...</div>}>
            <BonusesContent />
        </Suspense>
    );
}

function BonusesContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Bonuses */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Gift className="w-6 h-6 text-brand-yellow" />
                    Checkout Bonuses
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage promotional gifts and bonus items awarded on checkouts.
                </p>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <BonusesManager />
            </div>
        </div>
    );
}
