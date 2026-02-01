"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/store/purchase-button";
import Image from "next/image";
import { BarChart3, Newspaper, Rocket, Package, Layers, Sparkles, ChevronDown } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { useTranslations, useLocale } from "next-intl";

interface Service {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    currency: string | null;
    interval: string;
    image: string | null;
    features: unknown;
    updatedAt: Date;
}

interface ProductListProps {
    initialServices: Service[];
}

export function ProductList({ initialServices }: ProductListProps) {
    const t = useTranslations("ProductCatalog");
    const locale = useLocale();
    const isId = locale === 'id';

    // State for Load More
    const [visibleCount, setVisibleCount] = useState(3);

    const icons = [BarChart3, Newspaper, Rocket, Package, Layers, Sparkles];
    const colors = ["text-brand-yellow", "text-brand-grey", "text-emerald-400"];
    const bgs = ["bg-brand-yellow/10", "bg-brand-grey/10", "bg-emerald-400/10"];

    const visibleServices = initialServices.slice(0, visibleCount);

    return (
        <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
                {visibleServices.map((service, i) => {
                    // Bilingual Logic
                    const title = (isId && service.title_id) ? service.title_id : service.title;
                    const desc = (isId && service.description_id) ? service.description_id : service.description;

                    // Styling Logic
                    const Icon = icons[i % icons.length];
                    const color = colors[i % colors.length];
                    const bg = bgs[i % bgs.length];

                    // Interval Label
                    const intervalLabel = service.interval === 'one_time'
                        ? (isId ? 'Sekali Bayar' : 'One Time')
                        : (isId ? `Per ${service.interval}` : `Per ${service.interval}`);

                    return (
                        <div key={service.id} className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-8 hover:bg-zinc-900 transition-all hover:border-white/20 flex flex-col overflow-hidden relative">
                            {/* Icon or Image */}
                            <div className="mb-6 relative">
                                {service.image ? (
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={service.image}
                                            alt={title || "Service Icon"}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                        />
                                    </div>
                                ) : (
                                    <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${color}`} />
                                    </div>
                                )}
                            </div>

                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{intervalLabel}</div>
                            <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 min-h-[64px]">{title}</h3>
                            <div
                                className="text-zinc-400 mb-8 min-h-[80px] text-sm leading-relaxed line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: desc || "" }}
                            />

                            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                                <span className="text-white font-bold text-lg">
                                    <PriceDisplay amount={service.price} baseCurrency={service.currency as "USD" | "IDR"} />
                                </span>
                                <div className="w-auto">
                                    <PurchaseButton
                                        serviceId={service.id}
                                        interval={service.interval}
                                        customLabel={t("ctaGeneric")}
                                        className="bg-white text-black hover:bg-zinc-200 font-semibold h-9 px-4 rounded-md w-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Load More Button */}
            {initialServices.length > visibleCount && (
                <Button
                    variant="outline"
                    onClick={() => setVisibleCount(prev => prev + 3)}
                    className="border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-900"
                >
                    Load More <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            )}
        </div>
    );
}
