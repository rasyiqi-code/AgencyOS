"use client";

import { AffiliateManager } from "@/components/admin/marketing/affiliate-manager";
import { PayoutRequests } from "@/components/admin/marketing/payout-requests";
import { AssetsManager } from "@/components/admin/marketing/assets-manager";
import { DollarSign, Users, FolderOpen } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman sub-modul Affiliates di bawah Marketing Center.
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
                    <DollarSign className="w-6 h-6 text-brand-yellow" />
                    Affiliates & Payouts
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage affiliate partners, payout requests, and promotional marketing assets.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 items-start">
                {/* Kolom Kiri: Kelola Mitra dan Permintaan Payout */}
                <div className="xl:col-span-2 space-y-6 md:space-y-8">
                    {/* Daftar Affiliate Partner */}
                    <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                            <Users className="w-4 h-4 text-brand-yellow" />
                            Affiliate Partners List
                        </h2>
                        <AffiliateManager />
                    </div>

                    {/* Permintaan Payout */}
                    <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                            <DollarSign className="w-4 h-4 text-brand-yellow" />
                            Payout Requests
                        </h2>
                        <PayoutRequests />
                    </div>
                </div>

                {/* Kolom Kanan: Aset Pemasaran */}
                <div className="xl:col-span-1 bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                        <FolderOpen className="w-4 h-4 text-brand-yellow" />
                        Marketing Assets
                    </h2>
                    <AssetsManager />
                </div>
            </div>
        </div>
    );
}
