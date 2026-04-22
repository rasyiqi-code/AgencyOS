"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { Service, AddonType } from "./types";
import { useTranslations } from "next-intl";

interface ServiceHeroProps {
    service: Service;
    displayTitle: string;
    intervalLabel: string;
    selectedAddons: AddonType[];
}

export function ServiceHero({ service, displayTitle, intervalLabel, selectedAddons }: ServiceHeroProps) {
    const tService = useTranslations("Service");

    return (
        <div className="relative border-b border-white/5 bg-zinc-900/10 backdrop-blur-3xl mb-12 md:mb-20 overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand-yellow/[0.03] to-transparent pointer-events-none" />

            <div className="overflow-x-auto scrollbar-hide">
                <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 flex flex-row items-center gap-8 md:gap-16 p-4 md:p-10 lg:p-12 min-w-[520px] md:min-w-0">
                    <div className="flex-1 space-y-4 md:space-y-6">
                        <div className="space-y-1.5 md:space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[7px] md:text-[9px] font-bold text-brand-yellow uppercase tracking-[0.2em]">
                                <Sparkles className="w-2 md:w-3 h-2 md:h-3" />
                                {tService("premiumService")}
                            </div>
                            <h1 className="text-xl md:text-2xl lg:text-4xl font-black text-brand-yellow tracking-tighter leading-tight break-words max-w-sm md:max-w-xl">
                                {displayTitle}
                            </h1>
                        </div>

                        <div className="flex items-center gap-6 md:gap-12">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1 md:gap-2">
                                    {service.priceType === 'STARTING_AT' && (
                                        <span className="text-[9px] md:text-xs font-medium text-zinc-500 pb-0.5">
                                            {tService("startsAt")}
                                        </span>
                                    )}
                                    <div className="text-xl md:text-4xl font-black text-brand-yellow tracking-tighter">
                                        <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                        / {intervalLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="hidden sm:block">
                                <PurchaseButton
                                    serviceId={service.id}
                                    interval={service.interval}
                                    selectedAddons={selectedAddons}
                                    className="bg-brand-yellow hover:bg-brand-yellow/90 text-black px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-yellow/20 transition-all hover:scale-[1.05] active:scale-95 whitespace-nowrap"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-[200px] md:w-[320px] lg:w-[380px] shrink-0 space-y-3 md:space-y-4">
                        {service.image ? (
                            <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-xl group">
                                <Image
                                    src={service.image}
                                    alt={displayTitle}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    unoptimized={true}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ) : (
                            <div className="aspect-square rounded-xl md:rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-zinc-800" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
