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
                    className="py-2.5 px-4 sm:px-5 flex flex-row justify-between items-center gap-3 bg-zinc-900/20 hover:bg-zinc-900/40 border border-white/5 border-l-2 hover:border-l-brand-yellow rounded-2xl transition-all duration-300 group relative cursor-pointer"
                >
                    {/* Gaya Marquee Lokal Terisolasi */}
                    <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes marqueeMobileDashboard {
                            0% { transform: translate3d(0, 0, 0); }
                            100% { transform: translate3d(-50%, 0, 0); }
                        }
                        .marquee-container-db {
                            overflow-x: auto;
                            scrollbar-width: none;
                            white-space: nowrap;
                            width: 100%;
                            mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                            -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                        }
                        .marquee-container-db::-webkit-scrollbar {
                            display: none;
                        }
                        .marquee-content-db {
                            display: inline-block;
                            white-space: nowrap;
                            animation: marqueeMobileDashboard 12s linear infinite;
                        }
                        @media (min-width: 640px) {
                            .marquee-container-db {
                                overflow: hidden;
                                mask-image: none;
                                -webkit-mask-image: none;
                            }
                            .marquee-content-db {
                                animation: none;
                                display: block;
                                text-overflow: ellipsis;
                                overflow: hidden;
                            }
                        }
                    `}} />

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Judul */}
                        <div className="flex items-center gap-1 max-w-full">
                            <div className="marquee-container-db flex-1 min-w-0 block">
                                <div className="marquee-content-db">
                                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-snug pr-8 inline-block">
                                        {displayTitle}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-yellow transition-all duration-300 leading-snug sm:hidden pr-8 inline-block">
                                        {displayTitle}
                                    </span>
                                </div>
                            </div>
                            <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0 opacity-0 group-hover:opacity-100 transform translate-y-0.5 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300 hidden sm:block" />
                        </div>
                    </div>

                    {/* Aksi dan Harga */}
                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="text-right">
                            <div className="text-xs sm:text-sm font-black text-white tracking-tight leading-none">
                                <PriceDisplay amount={service.price} baseCurrency={((service as unknown as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} compact={true} />
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <DialogTrigger asChild>
                                <button className="h-7 px-2 text-[10px] text-zinc-400 hover:text-white hover:bg-white/5 font-semibold rounded transition-colors">
                                    {isId ? "Detail" : "Details"}
                                </button>
                            </DialogTrigger>
                            <PurchaseButton
                                serviceId={service.id}
                                interval={service.interval}
                                className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-7 px-2.5 rounded text-[9px] uppercase tracking-tight shadow-sm shadow-brand-yellow/10 transition-all duration-300 hover:shadow-brand-yellow/15 transform hover:scale-[1.01] active:scale-[0.99]"
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
