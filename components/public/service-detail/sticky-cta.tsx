"use client";

import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { Service, AddonType } from "./types";
import { useTranslations } from "next-intl";

interface StickyCTAProps {
    service: Service;
    intervalLabel: string;
    selectedAddons: AddonType[];
}

export function StickyCTA({ service, intervalLabel, selectedAddons }: StickyCTAProps) {
    const tService = useTranslations("Service");

    return (
        <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 lg:hidden z-[100]">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                <div>
                    <div className="text-xl font-black text-white tracking-tighter flex items-end gap-1.5">
                        {service.priceType === 'STARTING_AT' && (
                            <span className="text-[10px] font-medium text-zinc-500 pb-1">
                                {tService("startsAt")}
                            </span>
                        )}
                        <div className="flex items-end gap-1">
                            <PriceDisplay
                                amount={service.price + selectedAddons.reduce((sum, a) => sum + a.price, 0)}
                                baseCurrency={(service.currency as "USD" | "IDR") || 'USD'}
                                compact={true}
                            />
                            <span className="text-xs font-normal text-zinc-500 pb-0.5">/ {intervalLabel}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 max-w-[160px]">
                    <PurchaseButton
                        serviceId={service.id}
                        interval={service.interval}
                        selectedAddons={selectedAddons}
                        className="w-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-11 rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-brand-yellow/20 transition-colors"
                    />
                </div>
            </div>
        </div>
    );
}
