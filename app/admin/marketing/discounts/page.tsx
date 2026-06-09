"use client";

import { CouponsManager } from "@/components/admin/marketing/coupons-manager";
import { BonusesManager } from "@/components/admin/marketing/bonuses-manager";
import { Tag, Gift } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman sub-modul Discounts (Coupons & Bonuses) di bawah Marketing Center.
 */
export default function DiscountsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Discounts...</div>}>
            <DiscountsContent />
        </Suspense>
    );
}

function DiscountsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Discounts */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Tag className="w-6 h-6 text-brand-yellow" />
                    Coupons & Bonuses
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage discount coupon codes and checkout bonus rewards.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 items-start">
                {/* Bagian Coupon Codes */}
                <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                        <Tag className="w-4 h-4 text-brand-yellow" />
                        Coupon Codes
                    </h2>
                    <CouponsManager />
                </div>

                {/* Bagian Checkout Bonuses */}
                <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                        <Gift className="w-4 h-4 text-brand-yellow" />
                        Checkout Bonuses
                    </h2>
                    <BonusesManager />
                </div>
            </div>
        </div>
    );
}
