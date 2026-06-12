"use client";

import { useEffect, useMemo, useState } from "react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { Service, AddonType } from "./types";

interface StickyCTAProps {
    service: Service;
    intervalLabel: string;
    selectedAddons: AddonType[];
}

const STICKY_THRESHOLD = 300;

export function StickyCTA({ service, intervalLabel, selectedAddons }: StickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const nextVisible = window.scrollY > STICKY_THRESHOLD;

            setIsVisible((prevVisible) => {
                return prevVisible === nextVisible ? prevVisible : nextVisible;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const displayTitle = service.title_id || service.title || "Service";

    const baseCurrency =
        service.currency === "IDR" || service.currency === "USD"
            ? service.currency
            : "USD";

    const totalPrice = useMemo(() => {
        const servicePrice = Number(service.price) || 0;

        const addonTotal = selectedAddons.reduce((sum, addon) => {
            return sum + (Number(addon.price) || 0);
        }, 0);

        return servicePrice + addonTotal;
    }, [service.price, selectedAddons]);

    return (
        <div
            className={`fixed top-10 md:top-14 left-0 right-0 py-2.5 sm:py-3 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 z-30 transition-all duration-300 transform shadow-lg shadow-black/80 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
                {/* Judul Layanan di Sisi Kiri */}
                <div className="flex items-center min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-brand-yellow truncate block">
                        {displayTitle}
                    </span>
                </div>

                {/* Harga & Tombol Order di Sisi Kanan (Sebaris) */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="text-right flex flex-col justify-center select-none">
                        <span className="text-xs sm:text-sm font-black text-white tracking-tight leading-none whitespace-nowrap">
                            <PriceDisplay
                                amount={totalPrice}
                                baseCurrency={baseCurrency}
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
                        className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-8 sm:h-9 px-4 sm:px-6 rounded-full text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] shrink-0"
                    />
                </div>
            </div>
        </div>
    );
}