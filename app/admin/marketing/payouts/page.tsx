"use client";

import { PayoutRequests } from "@/components/admin/marketing/payout-requests";
import { DollarSign } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman modul Payout Requests mandiri.
 */
export default function PayoutRequestsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Payout Requests...</div>}>
            <PayoutRequestsContent />
        </Suspense>
    );
}

function PayoutRequestsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Payouts */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-brand-yellow" />
                    Payout Requests
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage affiliate commission payout requests and financial clearances.
                </p>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <PayoutRequests />
            </div>
        </div>
    );
}
