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
            <div>
                <LeadsManager />
            </div>
        </div>
    );
}
