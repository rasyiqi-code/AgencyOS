"use client";

import { PromotionsManager } from "@/components/admin/marketing/promotions-manager";
import { Suspense } from "react";

/**
 * Halaman modul Visual Promotions mandiri.
 */
export default function PromotionsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Promotions...</div>}>
            <PromotionsContent />
        </Suspense>
    );
}

function PromotionsContent() {
    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            <div>
                <PromotionsManager />
            </div>
        </div>
    );
}
