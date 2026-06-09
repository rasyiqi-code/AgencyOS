"use client";

import { LeadsManager } from "@/components/admin/marketing/leads-manager";
import { SubscribersManager } from "@/components/admin/marketing/subscribers-manager";
import { Users, Mail } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman sub-modul Audience (Leads & Subscribers) di bawah Marketing Center.
 */
export default function AudiencePage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Audience...</div>}>
            <AudienceContent />
        </Suspense>
    );
}

function AudienceContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Audience */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-brand-yellow" />
                    Audience & Leads
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage incoming contact requests, leads, and newsletter subscribers.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 items-start">
                {/* Bagian Contact Leads */}
                <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                        <Users className="w-4 h-4 text-brand-yellow" />
                        Contact Leads
                    </h2>
                    <LeadsManager />
                </div>

                {/* Bagian Newsletter Subscribers */}
                <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-2">
                        <Mail className="w-4 h-4 text-brand-yellow" />
                        Newsletter Subscribers
                    </h2>
                    <SubscribersManager />
                </div>
            </div>
        </div>
    );
}
