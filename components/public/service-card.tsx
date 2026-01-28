"use client";

import { Check } from "lucide-react";
// import { createServiceOrder } from "@/app/actions/store";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface ServiceCardProps {
    service: {
        id: string;
        title: string;
        description: string;
        price: number;
        interval: string;
        features: string[];
        image?: string | null;
    };
}

export function ServiceCard({ service }: ServiceCardProps) {
    return (
        <div className="relative flex flex-col rounded-2xl border border-white/10 bg-zinc-900/40 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-900/10 group overflow-hidden">
            {/* Image */}
            <div className="h-48 w-full bg-zinc-800/50 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                {service.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <span className="text-zinc-700 text-4xl font-bold opacity-20">{service.title.charAt(0)}</span>
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90" />
            </div>

            <div className="p-6 pt-2 flex flex-col flex-1">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{service.title}</h3>
                    <div className="text-sm text-zinc-400 mt-3 min-h-[48px] leading-relaxed line-clamp-2">
                        {service.description.replace(/<[^>]*>?/gm, '')}
                    </div>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                            <PriceDisplay amount={service.price} />
                        </span>
                        <span className="text-xs text-zinc-500 uppercase font-medium tracking-wide">
                            / {service.interval === 'one_time' ? 'once' : service.interval}
                        </span>
                    </div>
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-3 mb-8">
                    {(service.features as string[]).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                            <div className="mt-1 p-0.5 rounded-full bg-emerald-500/10 shrink-0">
                                <Check className="w-3 h-3 text-emerald-500" />
                            </div>
                            <span className="leading-snug text-zinc-300/90">{feature.replace(/<[^>]*>?/gm, '')}</span>
                        </li>
                    ))}
                </ul>

                {/* Action */}
                <div className="mt-auto">
                    <PurchaseButton serviceId={service.id} interval={service.interval} />
                </div>
            </div>
        </div>
    );
}
