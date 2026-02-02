"use client";

import { Check, Sparkles, ChevronDown } from "lucide-react";
import Image from "next/image";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";
import { useState } from "react";

// Basic Service Type until we import full type
interface Service {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    currency?: string | null;
    interval: string;
    features: unknown; // Prisma Json
    features_id?: unknown; // Prisma Json
    image: string | null;
}

interface ServiceCardProps {
    service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { currency } = useCurrency();

    const isId = currency === 'IDR';

    // Fallback to EN if ID content is missing
    const displayTitle = (isId && (service as unknown as Record<string, unknown>).title_id) ? (service as unknown as Record<string, unknown>).title_id as string : service.title;
    const displayDescription = (isId && (service as unknown as Record<string, unknown>).description_id) ? (service as unknown as Record<string, unknown>).description_id as string : service.description;

    const displayFeatures = (isId && Array.isArray((service as unknown as Record<string, unknown>).features_id) && ((service as unknown as Record<string, unknown>).features_id as string[]).length > 0)
        ? (service as unknown as Record<string, unknown>).features_id as string[]
        : service.features as string[];

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/60 backdrop-blur-xl p-8 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-yellow/10 flex flex-col h-full">
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="mb-6">
                    {/* Image - Square Aspect Ratio */}
                    {service.image ? (
                        <div className="mb-6 rounded-xl overflow-hidden border border-white/5 aspect-square relative group-hover:scale-[1.02] transition-transform duration-500">
                            <Image
                                src={service.image}
                                alt={displayTitle}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        </div>
                    ) : (
                        <div className="mb-6 rounded-xl overflow-hidden border border-white/5 aspect-square bg-zinc-900/50 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-zinc-700" />
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 mb-2 group-hover:from-brand-yellow group-hover:to-yellow-200 transition-all duration-300">
                        {displayTitle}
                    </h3>

                    {/* Price */}
                    <div className="mb-5">
                        <div className="flex flex-col items-start">
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                                <PriceDisplay amount={service.price} baseCurrency={((service as unknown as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} />
                            </span>
                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-1">
                                {service.interval === 'one_time'
                                    ? (isId ? 'Sekali Bayar' : 'One Time Payment')
                                    : (isId ? `Ditagih ${service.interval}` : `Billed ${service.interval}`)}
                            </span>
                        </div>
                    </div>

                    <div
                        className="text-sm text-zinc-400 leading-relaxed font-light line-clamp-3 mb-6"
                        dangerouslySetInnerHTML={{ __html: displayDescription }} // Description is rich text
                    />
                </div>

                {/* Features */}
                <div className="mb-8 flex-grow">
                    <ul className="space-y-3 mb-8 flex-1">
                        {displayFeatures.slice(0, expanded ? undefined : 3).map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 group/item animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-brand-yellow/20 to-yellow-500/20 border border-brand-yellow/20 group-hover/item:border-brand-yellow/40 transition-colors shrink-0">
                                    <Check className="w-2.5 h-2.5 text-brand-yellow" />
                                </div>
                                <span className="text-xs text-zinc-300 group-hover/item:text-white transition-colors leading-relaxed">
                                    {feature.replace(/<[^>]*>?/gm, '')}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {displayFeatures.length > 3 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-brand-yellow hover:text-brand-yellow/80 transition-colors flex items-center gap-1 font-medium tracking-wide uppercase"
                    >
                        {expanded ? 'Show Less' : `Show ${displayFeatures.length - 3} More`}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                )}

                {/* Action */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    <PurchaseButton
                        serviceId={service.id}
                        interval={service.interval}
                        className="bg-brand-yellow hover:bg-brand-yellow/90 text-black shadow-lg shadow-brand-yellow/20 h-10 text-xs font-bold"
                    />
                </div>
            </div>
        </div>
    );
}
