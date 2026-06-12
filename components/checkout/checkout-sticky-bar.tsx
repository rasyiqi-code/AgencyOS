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
        <div className="sticky bottom-0 z-50 w-full bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 py-4 px-6 md:px-8 mt-12 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] -mx-6 md:-mx-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] transition-all">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Sisi Kiri: Rincian Spesifikasi Proyek */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 w-full sm:w-auto">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">
                            Project Spec
                        </span>
                        <span className="text-xs font-extrabold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                            <Layers className="w-3.5 h-3.5 text-lime-400" />
                            {isId ? "1 Jasa Estimasi" : "1 Estimate Service"}
                        </span>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-5">
                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">
                            Add-ons Selected
                        </span>
                        <span className="text-xs font-extrabold text-zinc-300">
                            {selectedAddonsCount} {isId ? "Terpilih" : "Selected"}
                        </span>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-5">
                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">
                            Price Plan
                        </span>
                        <span className="text-xs font-mono font-bold text-brand-yellow">
                            <PriceDisplay amount={amountToPay} baseCurrency={baseCurrency} />
                        </span>
                    </div>
                </div>

                {/* Sisi Kanan: Tombol-Tombol Aksi Checkout */}
                <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
                    {/* Tombol Unduh PDF */}
                    <Button
                        variant="outline"
                        className="border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-300 h-10 px-4 rounded-xl cursor-pointer text-xs flex items-center gap-1.5"
                        onClick={onPrint}
                        disabled={isProcessing}
                    >
                        <Download className="w-3.5 h-3.5" />
                        {isId ? "Unduh PDF" : "Download PDF"}
                    </Button>

                    {/* Tombol Utama atau Status Transaksi */}
                    {activeOrderId ? (
                        <div className="text-[10px] text-zinc-500 font-bold bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-white/5 text-center leading-none select-none">
                            {isId ? "MENUNGGU PEMBAYARAN" : "AWAITING PAYMENT"}
                        </div>
                    ) : (
                        <Button
                            className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-extrabold h-10 px-6 rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(132,204,22,0.25)] transition-all duration-300 transform hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] text-xs"
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
                </div>

            </div>
        </div>
    );
}
