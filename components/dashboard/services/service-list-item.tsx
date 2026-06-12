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
                    className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-zinc-900/20 hover:bg-zinc-900/40 border border-white/5 border-l-2 hover:border-l-brand-yellow rounded-2xl transition-all duration-300 group relative cursor-pointer"
                >
                    <div className="flex-1 min-w-0">
                        {/* Badge Category & Interval */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold text-brand-yellow uppercase tracking-wider">
                                {service.category || (isId ? "Umum" : "General")}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                                {service.interval === 'one_time' ? t("oneTime") : service.interval}
                            </span>
                        </div>

                        {/* Judul */}
                        <div className="inline-flex items-center gap-1 group/title max-w-full">
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-tight truncate transform group-hover:translate-x-1">
                                {displayTitle}
                            </h3>
                            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0 opacity-0 group-hover:opacity-100 transform translate-y-0.5 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300" />
                        </div>
                    </div>

                    {/* Aksi dan Harga */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="text-left md:text-right">
                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">
                                {t("startsAt")}
                            </div>
                            <div className="text-base sm:text-lg font-black text-white tracking-tight">
                                <PriceDisplay amount={service.price} baseCurrency={((service as unknown as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} compact={true} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DialogTrigger asChild>
                                <button className="h-9 px-3 text-xs text-zinc-400 hover:text-white hover:bg-white/5 font-semibold rounded-xl transition-colors">
                                    {isId ? "Detail" : "Details"}
                                </button>
                            </DialogTrigger>
                            <PurchaseButton
                                serviceId={service.id}
                                interval={service.interval}
                                className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-9 px-4 rounded-xl text-xs uppercase tracking-tight shadow-md shadow-brand-yellow/15 transition-all duration-300 hover:shadow-brand-yellow/20 transform hover:scale-[1.02] active:scale-[0.98]"
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
