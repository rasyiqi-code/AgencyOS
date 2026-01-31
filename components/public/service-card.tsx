
"use client";

import { Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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
    const displayTitle = (isId && service.title_id) ? service.title_id : service.title;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayDescription = (isId && service.description_id) ? service.description_id : service.description;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayFeatures = (isId && Array.isArray((service as any).features_id) && (service as any).features_id.length > 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (service as any).features_id as string[]
        : (Array.isArray(service.features) ? service.features as string[] : []);

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/60 backdrop-blur-xl p-8 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col h-full">
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="mb-6">
                    {/* Image - Square Aspect Ratio */}
                    {service.image ? (
                        <div className="mb-6 rounded-xl overflow-hidden border border-white/5 aspect-square relative group-hover:scale-[1.02] transition-transform duration-500">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={service.image}
                                alt={displayTitle}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        </div>
                    ) : (
                        <div className="mb-6 rounded-xl overflow-hidden border border-white/5 aspect-square bg-zinc-900/50 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-zinc-700" />
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 mb-2 group-hover:from-blue-400 group-hover:to-violet-400 transition-all duration-300">
                        {displayTitle}
                    </h3>

                    {/* Price */}
                    <div className="mb-5">
                        <div className="flex flex-col items-start">
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                                <PriceDisplay amount={service.price} />
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
                    <div className="space-y-3">
                        {displayFeatures.slice(0, expanded ? undefined : 3).map((feature: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 group/item animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 group-hover/item:border-emerald-500/40 transition-colors shrink-0">
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                </div>
                                <span className="text-xs text-zinc-300 group-hover/item:text-white transition-colors leading-relaxed">
                                    {feature.replace(/<[^>]*>?/gm, '')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {displayFeatures.length > 3 && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setExpanded(!expanded);
                            }}
                            className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-colors mb-6 mx-auto w-fit"
                        >
                            {expanded ? (
                                <>
                                    Show Less <ChevronUp className="w-3 h-3" />
                                </>
                            ) : (
                                <>
                                    Show All ({displayFeatures.length - 3} more) <ChevronDown className="w-3 h-3" />
                                </>
                            )}
                        </button>
                    )}

                    {/* Action */}
                    <div className="mt-auto pt-4 border-t border-white/5">
                        <PurchaseButton
                            serviceId={service.id}
                            interval={service.interval}
                            className="bg-white hover:bg-zinc-100 text-black shadow-lg shadow-white/5 hover:shadow-white/10 h-9 text-xs"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
