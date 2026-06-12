"use client";

import { useEffect, useState } from "react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { Service, AddonType } from "./types";

interface StickyCTAProps {
    service: Service;
    intervalLabel: string;
    selectedAddons: AddonType[];
}

export function StickyCTA({ service, intervalLabel, selectedAddons }: StickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Tampilkan bar sticky ketika pengguna menggulir ke bawah melewati 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Panggilan inisialisasi awal

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const displayTitle = service.title_id || service.title;

    return (
        <div
            className={`fixed top-10 md:top-14 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6 z-30 transition-all duration-300 transform ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
            }`}
        >
            <div className="flex justify-end w-full">
                <div className="py-2.5 px-4 sm:px-5 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/80 flex items-center gap-4 sm:gap-6 rounded-none">
                    {/* Judul Layanan di Sisi Kiri */}
                    <span className="text-xs sm:text-sm font-bold text-brand-yellow whitespace-nowrap">
                        {displayTitle}
                    </span>

                    {/* Pembatas Vertikal Tipis */}
                    <div className="h-4 w-[1px] bg-white/10 shrink-0" />

                    {/* Harga & Tombol Order di Sisi Kanan (Rapat) */}
                    <div className="flex items-center gap-3 sm:gap-4.5 shrink-0">
                        <div className="text-right flex flex-col justify-center select-none">
                            <span className="text-xs sm:text-sm font-black text-white tracking-tight leading-none whitespace-nowrap">
                                <PriceDisplay
                                    amount={service.price + selectedAddons.reduce((sum, a) => sum + a.price, 0)}
                                    baseCurrency={(service.currency as "USD" | "IDR") || 'USD'}
                                    compact={true}
                                />
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-medium text-zinc-500 tracking-tight leading-none mt-1 whitespace-nowrap">
                                / {intervalLabel}
                            </span>
                        </div>

                        <PurchaseButton
                            serviceId={service.id}
                            interval={service.interval}
                            selectedAddons={selectedAddons}
                            className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-7.5 sm:h-8 px-3.5 sm:px-5 rounded-none text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
