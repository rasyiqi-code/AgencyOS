"use client";

import { Check, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ServiceModalContent, type Service } from "./service-modal-content";

interface ServiceListItemProps {
    service: Service;
}

export function ServiceListItem({ service }: ServiceListItemProps) {
    const { currency } = useCurrency();
    const t = useTranslations("Service");
    const isId = currency === 'IDR';

    const displayTitle = (isId && (service as unknown as Record<string, unknown>).title_id) ? (service as unknown as Record<string, unknown>).title_id as string : service.title;
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className="py-3 px-4 sm:px-5 flex flex-row justify-between items-center gap-4 bg-zinc-900/20 hover:bg-zinc-900/40 border border-white/5 border-l-2 hover:border-l-brand-yellow rounded-2xl transition-all duration-300 group relative cursor-pointer"
                >
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Badge Category & Interval */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[8px] font-bold text-brand-yellow uppercase tracking-wider leading-none">
                                {service.category || (isId ? "Umum" : "General")}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-semibold text-zinc-400 uppercase tracking-wider leading-none">
                                {service.interval === 'one_time' ? t("oneTime") : service.interval}
                            </span>
                        </div>

                        {/* Judul */}
                        <div className="inline-flex items-center gap-1 group/title max-w-full">
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-snug truncate transform group-hover:translate-x-0.5">
                                {displayTitle}
                            </h3>
                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0 opacity-0 group-hover:opacity-100 transform translate-y-0.5 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300" />
                        </div>
                    </div>

                    {/* Aksi dan Harga */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="text-right">
                            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-0.5">
                                {t("startsAt")}
                            </div>
                            <div className="text-sm sm:text-base font-black text-white tracking-tight leading-none">
                                <PriceDisplay amount={service.price} baseCurrency={((service as unknown as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} compact={true} />
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <DialogTrigger asChild>
                                <button className="h-8 px-2.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 font-semibold rounded-lg transition-colors">
                                    {isId ? "Detail" : "Details"}
                                </button>
                            </DialogTrigger>
                            <PurchaseButton
                                serviceId={service.id}
                                interval={service.interval}
                                className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-8 px-3 rounded-lg text-[10px] uppercase tracking-tight shadow-md shadow-brand-yellow/15 transition-all duration-300 hover:shadow-brand-yellow/20 transform hover:scale-[1.02] active:scale-[0.98]"
                            />
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            {/* Modal Content */}
            <ServiceModalContent service={service} isId={isId} />
        </Dialog>
    );
}
