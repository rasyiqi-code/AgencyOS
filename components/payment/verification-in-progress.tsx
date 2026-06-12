"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface VerificationInProgressProps {
    orderId: string;
    isId: boolean;
}

export function VerificationInProgress({ orderId, isId }: VerificationInProgressProps) {
    return (
        <div className="w-full bg-zinc-950/40 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-fit min-h-[360px] animate-in fade-in duration-500">
            {/* Indikator Verifikasi Berpendar */}
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-pulse">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                {isId ? "Verifikasi Sedang Berlangsung" : "Verification In Progress"}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                {isId 
                    ? "Kami telah menerima bukti pembayaran Anda. Tim kami sedang memverifikasinya saat ini. Biasanya ini membutuhkan waktu kurang dari 24 jam." 
                    : "We have received your payment proof. Our team is verifying it now. This usually takes less than 24 hours."}
            </p>

            <div className="mt-8 p-4 bg-zinc-950/60 rounded-xl border border-white/5 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span>{isId ? "ID Pesanan:" : "Order ID:"}</span>
                <span className="text-zinc-300 font-mono font-bold tracking-wider">{orderId}</span>
            </div>
        </div>
    );
}
