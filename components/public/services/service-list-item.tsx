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
            className="py-3 px-4 sm:px-5 flex flex-row justify-between items-center gap-4 hover:bg-zinc-900/10 border-l-2 border-l-transparent hover:border-l-brand-yellow transition-all duration-300 group relative"
        >
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* Badge Category & Interval */}
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[8px] font-bold text-brand-yellow uppercase tracking-wider leading-none">
                        {service.category || (isId ? "Umum" : "General")}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-semibold text-zinc-400 uppercase tracking-wider leading-none">
                        {service.interval === 'one_time' ? (isId ? "Sekali Bayar" : "One-time") : service.interval}
                    </span>
                </div>

                {/* Judul & Link Detail */}
                <Link href={`/services/${service.slug || service.id}`} className="inline-flex items-center gap-1 group/title max-w-full">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-snug truncate transform group-hover:translate-x-0.5">
                        {titleText}
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0 opacity-0 group-hover:opacity-100 transform translate-y-0.5 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300" />
                </Link>
            </div>

            {/* Aksi dan Harga */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="text-right">
                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-0.5">
                        {isId ? "Mulai Dari" : "Starting At"}
                    </div>
                    <div className="text-sm sm:text-base font-black text-white tracking-tight leading-none">
                        <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Link href={`/services/${service.slug || service.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 px-2.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 font-semibold rounded-lg">
                            {isId ? "Detail" : "Details"}
                        </Button>
                    </Link>
                    <PurchaseButton
                        serviceId={service.id}
                        interval={service.interval}
                        className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-8 px-3 rounded-lg text-[10px] uppercase tracking-tight shadow-md shadow-brand-yellow/15 transition-all duration-300 hover:shadow-brand-yellow/20 transform hover:scale-[1.02] active:scale-[0.98]"
                    />
                </div>
            </div>
        </div>
    );
}
