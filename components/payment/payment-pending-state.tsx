"use client";

import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentPendingStateProps {
    isId: boolean;
    onContinue: () => void;
    onCancel: () => void;
    hasUploadedProof?: boolean;
}

export function PaymentPendingState({ isId, onContinue, onCancel, hasUploadedProof = false }: PaymentPendingStateProps) {
    return (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 p-6 py-10 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 backdrop-blur-md animate-in fade-in zoom-in duration-300 min-h-[320px]">
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-zinc-950 animate-ping" />
            </div>

            <div className="space-y-1.5 max-w-xs">
                <h3 className="text-lg font-bold text-white tracking-wide">
                    {isId ? "Pembayaran Tertunda" : "Payment Pending"}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                    {isId 
                        ? "Selesaikan transaksi pembayaran Anda melalui petunjuk yang telah dibuat." 
                        : "Please complete your transaction using the generated instructions."}
                </p>
            </div>

            {/* Kotak peringatan jika belum mengunggah bukti pembayaran */}
            {!hasUploadedProof && (
                <div className="w-full max-w-xs p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-left animate-in fade-in slide-in-from-top-1 duration-300">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <div className="text-xs font-bold text-amber-400">
                            {isId ? "Bukti Belum Diunggah" : "Proof Not Uploaded"}
                        </div>
                        <p className="text-[10px] text-amber-200/70 leading-normal mt-0.5">
                            {isId 
                                ? "Unggah bukti pembayaran agar pesanan Anda dapat diverifikasi oleh admin."
                                : "Please upload your payment proof so your order can be verified."}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2.5 w-full max-w-[220px]">
                <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold shadow-[0_4px_15px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-all duration-300 rounded-xl"
                    onClick={onContinue}
                >
                    {isId ? "Lanjutkan Pembayaran" : "Continue to Payment"}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-zinc-500 hover:text-white hover:bg-white/5 transition-all rounded-lg"
                    onClick={onCancel}
                >
                    {isId ? "Batalkan / Ubah Metode" : "Cancel / Change Method"}
                </Button>
            </div>
        </div>
    );
}
