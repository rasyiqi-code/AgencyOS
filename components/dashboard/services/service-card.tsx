"use client";

import { Check, Sparkles, ChevronDown } from "lucide-react";
import { useTranslations } from "@/lib/i18n/hooks";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { useState } from "react";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceModalContent, type Service } from "./service-modal-content";

interface ServiceCardProps {
    service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const { currency } = useCurrency();
    const t = useTranslations("Service");
    const tCards = useTranslations("Cards");
    const isId = currency === 'IDR';

    const displayTitle = (isId && (service as unknown as Record<string, unknown>).title_id) ? (service as unknown as Record<string, unknown>).title_id as string : service.title;
    const displayDescription = (isId && (service as unknown as Record<string, unknown>).description_id) ? (service as unknown as Record<string, unknown>).description_id as string : service.description;

    const displayFeatures = (isId && Array.isArray((service as unknown as Record<string, unknown>).features_id) && ((service as unknown as Record<string, unknown>).features_id as string[]).length > 0)
        ? (service as unknown as Record<string, unknown>).features_id as string[]
        : service.features as string[];

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <Dialog>
            <div
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:border-brand-yellow/30 overflow-hidden flex flex-col h-full shadow-2xl"
            >
                {/* Interactive Glow Effect */}
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(254, 215, 0, 0.1), transparent 40%)`,
                    }}
                />

                {/* Visual Block */}
                <div className="relative h-44 bg-zinc-950/80 flex items-center justify-center overflow-hidden shrink-0">
                    {service.image ? (
                        <img
                            src={service.image}
                            alt={displayTitle}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[#161618] flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-zinc-700" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col flex-grow p-5 relative z-10">
                    {/* Header Block */}
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2.5">
                            <div className="px-2.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold text-brand-yellow uppercase tracking-wider">
                                {service.interval === 'one_time'
                                    ? t("oneTime")
                                    : service.interval}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-brand-yellow transition-colors leading-snug">
                            {displayTitle}
                        </h3>
                    </div>

                    <div className="mt-auto">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Features Block */}
                            <div className="p-3.5 rounded-2xl bg-[#121214] border border-white/5 flex flex-col justify-between min-h-[120px] group/list">
                                <ul className="space-y-1.5">
                                    {displayFeatures.slice(0, 3).map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1.5 group/item">
                                            <Check className="w-3.5 h-3.5 text-brand-yellow shrink-0 mt-0.5" />
                                            <span className="text-[10px] text-zinc-400 group-hover/item:text-white transition-colors line-clamp-1">{feature.replace(/<[^>]*>?/gm, '')}</span>
                                        </li>
                                    ))}
                                </ul>
                                {displayFeatures.length > 3 && (
                                    <DialogTrigger asChild>
                                        <button className="text-[9px] text-brand-yellow font-bold uppercase tracking-wider mt-2 flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer text-left">
                                            +{displayFeatures.length - 3} {tCards("more")} <ChevronDown className="w-2.5 h-2.5" />
                                        </button>
                                    </DialogTrigger>
                                )}
                            </div>

                            {/* Metrics Block */}
                            <div className="p-3.5 rounded-2xl bg-brand-yellow/5 border border-brand-yellow/10 flex flex-col justify-between min-h-[120px]">
                                <div>
                                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{tCards("price")}</div>
                                    {(service as unknown as Record<string, unknown>).priceType === 'STARTING_AT' && (
                                        <span className="text-[8px] font-normal text-zinc-400 leading-none mb-0.5 block">
                                            {t("startsAt")}
                                        </span>
                                    )}
                                    <div className="text-base font-black text-white tracking-tight break-all line-clamp-1 group-hover:line-clamp-none transition-all">
                                        <PriceDisplay amount={service.price} baseCurrency={((service as unknown as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} compact={true} />
                                    </div>
                                </div>
                                <PurchaseButton
                                    serviceId={service.id}
                                    interval={service.interval}
                                    customLabel="PURCHASE PACKAGE"
                                    className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-8 px-2 rounded-lg w-full text-[9px] uppercase tracking-wide shadow-lg shadow-brand-yellow/10 transition-colors shrink-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Content */}
            <ServiceModalContent service={service} isId={isId} />
        </Dialog>
    );
}
