"use client";

import { PushManager } from "@/components/admin/marketing/push-manager";

export default function PushAdminPage() {
    return (
        <div className="w-full py-2 md:py-6 space-y-6 md:space-y-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Push Notification Center
                </h1>
                <p className="text-zinc-400 mt-1">
                    Kirim tips, trik, atau pengumuman produk baru langsung ke browser tamu.
                </p>
            </div>

            <PushManager />
        </div>
    );
}
