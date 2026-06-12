"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { Button } from "@/components/ui/button";

interface Service {
    id: string;
    title: string;
    title_id?: string | null;
    slug?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    currency?: string | null;
    interval: string;
    features: unknown;
    category?: string | null;
    features_id?: unknown;
    image: string | null;
}

interface ServiceListItemProps {
    service: Service;
    isId: boolean;
}

export function ServiceListItem({ service, isId }: ServiceListItemProps) {
    const titleText = (isId ? service.title_id : null) || service.title || "";

    return (
        <div
            className="py-2.5 px-4 sm:px-5 flex flex-row justify-between items-center gap-3 hover:bg-zinc-900/10 border-l-2 border-l-transparent hover:border-l-brand-yellow transition-all duration-300 group relative"
        >
            {/* Gaya Marquee Lokal Terisolasi */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marqueeMobile {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .marquee-container {
                    overflow-x: auto;
                    scrollbar-width: none;
                    white-space: nowrap;
                    width: 100%;
                    mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                }
                .marquee-container::-webkit-scrollbar {
                    display: none;
                }
                .marquee-content {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marqueeMobile 12s linear infinite;
                }
                @media (min-width: 640px) {
                    .marquee-container {
                        overflow: hidden;
                        mask-image: none;
                        -webkit-mask-image: none;
                    }
                    .marquee-content {
                        animation: none;
                        display: block;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                }
            `}} />

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* Judul & Link Detail */}
                <div className="flex items-center gap-1 max-w-full">
                    <Link href={`/services/${service.slug || service.id}`} className="marquee-container flex-1 min-w-0 block">
                        <div className="marquee-content">
                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-snug pr-8 inline-block">
                                {titleText}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-snug sm:hidden pr-8 inline-block">
                                {titleText}
                            </span>
                        </div>
                    </Link>
                    <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0 opacity-0 group-hover:opacity-100 transform translate-y-0.5 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300 hidden sm:block" />
                </div>
            </div>

            {/* Aksi dan Harga */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                    <div className="text-xs sm:text-sm font-black text-white tracking-tight leading-none">
                        <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Link href={`/services/${service.slug || service.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-zinc-400 hover:text-white hover:bg-white/5 font-semibold rounded">
                            {isId ? "Detail" : "Details"}
                        </Button>
                    </Link>
                    <PurchaseButton
                        serviceId={service.id}
                        interval={service.interval}
                        className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-7 px-2.5 rounded text-[9px] uppercase tracking-tight shadow-sm shadow-brand-yellow/10 transition-all duration-300 hover:shadow-brand-yellow/15 transform hover:scale-[1.01] active:scale-[0.99]"
                    />
                </div>
            </div>
        </div>
    );
}
