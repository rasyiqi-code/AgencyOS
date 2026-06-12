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
            // Tampilkan bar sticky ketika pengguna menggulir ke bawah melewati 200px
            if (window.scrollY > 200) {
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
            className={`fixed top-0 left-0 right-0 py-2 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 z-30 transition-all duration-300 transform shadow-md shadow-black/80 ${
                isVisible ? "translate-y-10 md:translate-y-14 opacity-100" : "translate-y-0 opacity-0 pointer-events-none"
            }`}
        >
            <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
                {/* Judul Layanan di Sisi Kiri */}
                <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-brand-yellow truncate block">
                        {displayTitle}
                    </span>
                </div>

                {/* Harga & Tombol Order di Sisi Kanan (Sebaris) */}
                <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
                    <div className="text-right flex flex-col justify-center select-none">
                        <span className="text-xs sm:text-sm font-black text-white tracking-tight leading-none whitespace-nowrap">
                            <PriceDisplay
                                amount={service.price + selectedAddons.reduce((sum, a) => sum + a.price, 0)}
                                baseCurrency={(service.currency as "USD" | "IDR") || 'USD'}
                                compact={true}
                            />
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-medium text-zinc-500 tracking-tight leading-none mt-0 whitespace-nowrap">
                            / {intervalLabel}
                        </span>
                    </div>

                    <PurchaseButton
                        serviceId={service.id}
                        interval={service.interval}
                        selectedAddons={selectedAddons}
                        className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-[26px] sm:h-7.5 px-2.5 sm:px-3.5 rounded-none text-[9px] sm:text-[10px] uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                    />
                </div>
            </div>
        </div>
    );
}
