"use client";

import { AssetsManager } from "@/components/admin/marketing/assets-manager";
import { FolderOpen } from "lucide-react";
import { Suspense } from "react";

/**
 * Halaman modul Marketing Assets mandiri.
 */
export default function AssetsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Assets...</div>}>
            <AssetsContent />
        </Suspense>
    );
}

function AssetsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            {/* Header lokal halaman Assets */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <FolderOpen className="w-6 h-6 text-brand-yellow" />
                    Marketing Assets
                </h1>
                <p className="text-zinc-400 mt-1">
                    Manage and upload promotional banners and marketing assets for affiliates.
                </p>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
                <AssetsManager />
            </div>
        </div>
    );
}
