"use client";

import { CouponsManager } from "@/components/admin/marketing/coupons-manager";
import { Tag } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman modul Coupon Codes mandiri.
 */
export default function CouponsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Coupons...</div>}>
            <CouponsContent />
        </Suspense>
    );
}

function CouponsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Coupons */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Tag className="w-6 h-6 text-brand-yellow" />
                    Coupon Codes
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage discount coupons, limits, and checkout promotional codes.
                </p>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <CouponsManager />
            </div>
        </div>
    );
}
