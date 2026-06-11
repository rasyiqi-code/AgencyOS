"use client";

import { LeadsManager } from "@/components/admin/marketing/leads-manager";
import { UserPlus } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman modul Contact Leads mandiri.
 */
export default function LeadsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Leads...</div>}>
            <LeadsContent />
        </Suspense>
    );
}

function LeadsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <LeadsManager />
            </div>
        </div>
    );
}
