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
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* Badge Category & Interval */}
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-brand-yellow/10 border border-brand-yellow/20 text-[7px] font-semibold text-brand-yellow uppercase tracking-wider leading-none">
                        {service.category || (isId ? "Umum" : "General")}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[7px] font-medium text-zinc-400 uppercase tracking-wider leading-none">
                        {service.interval === 'one_time' ? (isId ? "Sekali Bayar" : "One-time") : service.interval}
                    </span>
                </div>

                {/* Judul & Link Detail */}
                <Link href={`/services/${service.slug || service.id}`} className="inline-flex items-center gap-1 group/title max-w-full">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-snug truncate transform group-hover:translate-x-0.5">
                        {titleText}
                    </h3>
                    <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0 opacity-0 group-hover:opacity-100 transform translate-y-0.5 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300" />
                </Link>
            </div>

            {/* Aksi dan Harga */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                    <div className="text-[7px] font-semibold text-zinc-500 uppercase tracking-widest leading-none mb-0.5">
                        {isId ? "Mulai Dari" : "Starting At"}
                    </div>
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
