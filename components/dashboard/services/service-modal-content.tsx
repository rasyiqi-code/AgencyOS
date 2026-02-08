"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay } from "@/components/providers/currency-provider";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";

export interface Service {
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

interface ServiceModalContentProps {
    service: Service;
    isId: boolean;
}

export function ServiceModalContent({ service, isId }: ServiceModalContentProps) {

    // Fallback to EN if ID content is missing
    const displayTitle = (isId && (service as unknown as Record<string, unknown>).title_id) ? (service as unknown as Record<string, unknown>).title_id as string : service.title;
    const displayDescription = (isId && (service as unknown as Record<string, unknown>).description_id) ? (service as unknown as Record<string, unknown>).description_id as string : service.description;

    const displayFeatures = (isId && Array.isArray((service as unknown as Record<string, unknown>).features_id) && ((service as unknown as Record<string, unknown>).features_id as string[]).length > 0)
        ? (service as unknown as Record<string, unknown>).features_id as string[]
        : service.features as string[];

    return (
        <DialogContent className="max-w-none w-screen h-[100dvh] bg-zinc-950 border-none p-0 overflow-hidden shadow-2xl flex flex-col sm:rounded-none">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {service.image && (
                    <Image
                        src={service.image}
                        alt={displayTitle}
                        fill
                        className="object-cover opacity-20 blur-[120px] scale-125"
                        unoptimized={true}
                    />
                )}
                <div className="absolute inset-0 bg-zinc-950/60" />
            </div>

            {/* Floating Action Cluster */}
            <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
                <PurchaseButton
                    serviceId={service.id}
                    interval={service.interval}
                    className="bg-brand-yellow hover:bg-brand-yellow/90 text-black px-6 py-3 rounded-full font-black text-sm uppercase tracking-tighter shadow-xl shadow-brand-yellow/20 transition-all hover:scale-105 active:scale-95"
                />
                <DialogClose className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all">
                    <X className="w-6 h-6" />
                </DialogClose>
            </div>

            <div className="flex-grow overflow-y-auto scrollbar-custom relative z-10 pt-24">
                <div className="max-w-4xl mx-auto p-8 pt-0">
                    <DialogHeader className="mb-8 pt-12">
                        <DialogTitle className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                            {displayTitle}
                        </DialogTitle>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-brand-yellow">
                                <PriceDisplay amount={service.price} baseCurrency={((service as unknown as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} />
                            </span>
                            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                                {service.interval === 'one_time'
                                    ? (isId ? '/ Sekali Bayar' : '/ One Time')
                                    : (isId ? `/ ${service.interval}` : `/ ${service.interval}`)}
                            </span>
                        </div>
                    </DialogHeader>

                    <div className="space-y-12 pb-24">
                        <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">About this service</h4>
                            <div
                                className="text-zinc-300 leading-relaxed font-light"
                                dangerouslySetInnerHTML={{ __html: displayDescription }}
                            />
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">What&apos;s Included</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayFeatures.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-yellow/20 transition-colors group/feat">
                                        <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 group-hover/feat:bg-brand-yellow/20 transition-colors shrink-0">
                                            <Check className="w-3 h-3 text-brand-yellow" />
                                        </div>
                                        <span className="text-sm text-zinc-300 leading-tight group-hover/feat:text-white transition-colors">
                                            {feature.replace(/<[^>]*>?/gm, '')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
}
