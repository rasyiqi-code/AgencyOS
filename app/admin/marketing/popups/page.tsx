"use client";

import { PopUpsManager } from "@/components/admin/marketing/popups-manager";
import { LayoutTemplate } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman modul PopUp Banners mandiri.
 */
export default function PopUpsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading PopUps...</div>}>
            <PopUpsContent />
        </Suspense>
    );
}

function PopUpsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <PopUpsManager />
            </div>
        </div>
    );
}
