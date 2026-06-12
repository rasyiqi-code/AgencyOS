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
            className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:bg-zinc-900/10 border-l-2 border-l-transparent hover:border-l-brand-yellow transition-all duration-300 group relative"
        >
            <div className="flex-1 min-w-0">
                {/* Badge Category & Interval */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold text-brand-yellow uppercase tracking-wider">
                        {service.category || (isId ? "Umum" : "General")}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                        {service.interval === 'one_time' ? (isId ? "Sekali Bayar" : "One-time") : service.interval}
                    </span>
                </div>

                {/* Judul & Link Detail */}
                <Link href={`/services/${service.slug || service.id}`} className="inline-flex items-center gap-1 group/title max-w-full">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-tight truncate transform group-hover:translate-x-1">
                        {titleText}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0 opacity-0 group-hover:opacity-100 transform translate-y-0.5 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300" />
                </Link>
            </div>

            {/* Aksi dan Harga */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">
                        {isId ? "Mulai Dari" : "Starting At"}
                    </div>
                    <div className="text-base sm:text-lg font-black text-white tracking-tight">
                        <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={`/services/${service.slug || service.id}`}>
                        <Button size="sm" variant="ghost" className="h-9 text-xs text-zinc-400 hover:text-white hover:bg-white/5 font-semibold">
                            {isId ? "Detail" : "Details"}
                        </Button>
                    </Link>
                    <PurchaseButton
                        serviceId={service.id}
                        interval={service.interval}
                        className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-9 px-4 rounded-xl text-xs uppercase tracking-tight shadow-md shadow-brand-yellow/15 transition-all duration-300 hover:shadow-brand-yellow/20 transform hover:scale-[1.02] active:scale-[0.98]"
                    />
                </div>
            </div>
        </div>
    );
}
