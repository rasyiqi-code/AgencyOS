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
            className={`fixed bottom-0 left-0 right-0 py-3.5 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 z-40 transition-all duration-300 transform shadow-[0_-10px_30px_rgba(0,0,0,0.8)] ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
                {/* Judul Layanan di Sisi Kiri */}
                <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-brand-yellow truncate block">
                        {displayTitle}
                    </span>
                </div>

                {/* Harga & Tombol Order di Sisi Kanan (Sebaris) */}
                <div className="flex items-center gap-3 md:gap-5 shrink-0">
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
                        className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-8 sm:h-9 px-4 sm:px-6 rounded-none text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                    />
                </div>
            </div>
        </div>
    );
}
