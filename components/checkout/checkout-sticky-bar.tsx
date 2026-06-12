"use client";

import { useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";
import { Loader2, Layers, Download } from "lucide-react";

interface CheckoutStickyBarProps {
    amountToPay: number;
    baseCurrency: "USD" | "IDR";
    selectedAddonsCount: number;
    activeOrderId: string | null;
    isProcessing: boolean;
    onPrint: () => void;
    onCheckout: () => void;
    isPaid: boolean;
    isId: boolean;
}

export function CheckoutStickyBar({
    amountToPay,
    baseCurrency,
    selectedAddonsCount,
    activeOrderId,
    isProcessing,
    onPrint,
    onCheckout,
    isPaid,
    isId
}: CheckoutStickyBarProps) {
    const t = useTranslations("Checkout");

    // Jika status pembayaran sudah lunas (PAID), kita tidak perlu menampilkan sticky bar ini
    if (isPaid) return null;

    return (
        <div className="sticky bottom-0 z-50 w-full bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 py-4 px-4 sm:px-6 md:px-8 mt-12 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] -mx-4 sm:-mx-6 md:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] transition-all">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Sisi Kiri: Rincian Spesifikasi Proyek */}
                <div className="flex items-center justify-between md:justify-start gap-x-5 gap-y-1.5 w-full md:w-auto border-b border-white/5 pb-3 md:pb-0 md:border-b-0">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">
                            Project Spec
                        </span>
                        <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-brand-yellow" />
                            {isId ? "1 Jasa Estimasi" : "1 Estimate Service"}
                        </span>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-5">
                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">
                            Add-ons
                        </span>
                        <span className="text-xs font-extrabold text-zinc-300">
                            {selectedAddonsCount} {isId ? "Terpilih" : "Selected"}
                        </span>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-5 ml-auto md:ml-0">
                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">
                            Price Plan
                        </span>
                        <span className="text-xs font-mono font-bold text-brand-yellow">
                            <PriceDisplay amount={amountToPay} baseCurrency={baseCurrency} />
                        </span>
                    </div>
                </div>

                {/* Sisi Kanan: Tombol-Tombol Aksi Checkout */}
                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                    {/* Tombol Utama atau Status Transaksi */}
                    {activeOrderId ? (
                        <div className="text-[10px] text-zinc-500 font-bold bg-zinc-900/50 px-4 py-3 rounded-xl border border-white/5 text-center leading-none select-none flex-1 md:flex-none">
                            {isId ? "MENUNGGU PEMBAYARAN" : "AWAITING PAYMENT"}
                        </div>
                    ) : (
                        <Button
                            className="bg-gradient-to-r from-brand-yellow to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold h-11 px-6 rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(254,215,0,0.25)] transition-all duration-300 flex-1 md:flex-none text-xs uppercase tracking-wider"
                            disabled={isProcessing}
                            onClick={onCheckout}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                    {t("processing")}
                                </>
                            ) : (
                                isId ? "PROSES SEKARANG" : "PROCEED TO PAYMENT"
                              )}
                        </Button>
                    )}

                    {/* Tombol Unduh PDF */}
                    <Button
                        variant="outline"
                        className="border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-300 h-11 px-4 rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1.5 shrink-0"
                        onClick={onPrint}
                        disabled={isProcessing}
                        aria-label={isId ? "Unduh PDF" : "Download PDF"}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {isId ? "Unduh PDF" : "Download PDF"}
                        </span>
                    </Button>
                </div>

            </div>
        </div>
    );
}
