"use client";

import { Check, Sparkles, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay } from "@/components/providers/currency-provider";
import Link from "next/link";
import { useTranslations } from "next-intl";

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
    slug?: string | null;
}

interface ServiceDetailContentProps {
    service: Service;
    isId: boolean;
    showBack?: boolean;
    trustedAvatars?: string[];
}

export function ServiceDetailContent({ service, isId, showBack = false, trustedAvatars = [] }: ServiceDetailContentProps) {
    const t = useTranslations("Cards");
    const st = useTranslations("Services");

    // Fallback to EN if ID content is missing
    const displayTitle = (isId && (service as unknown as Record<string, unknown>).title_id) ? (service as unknown as Record<string, unknown>).title_id as string : service.title;
    const displayDescription = (isId && (service as unknown as Record<string, unknown>).description_id) ? (service as unknown as Record<string, unknown>).description_id as string : service.description;

    const displayFeatures = (isId && Array.isArray((service as unknown as Record<string, unknown>).features_id) && ((service as unknown as Record<string, unknown>).features_id as string[]).length > 0)
        ? (service as unknown as Record<string, unknown>).features_id as string[]
        : service.features as string[];

    const intervalLabel = service.interval === 'one_time' ? t("oneTime") : (isId ? (service.interval === 'monthly' ? t("monthly") : service.interval) : service.interval);

    return (
        <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
            {/* Standard Landing Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Radial Gradients */}
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-brand-yellow/5 blur-[120px]" />
                <div className="absolute -left-20 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />

                {service.image && (
                    <div className="absolute -right-20 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-brand-yellow/5 blur-[150px] opacity-30" />
                )}
            </div>

            <div className="flex-grow z-10 pt-10 md:pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    {showBack && (
                        <Link
                            href="/services"
                            className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-white mb-6 transition-all gap-2 group hover:translate-x-[-4px]"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform" />
                            {st("backToHome")}
                        </Link>
                    )}

                    {/* HERO SECTION: More Compact */}
                    <div className="relative rounded-[32px] border border-white/5 bg-zinc-900/20 backdrop-blur-3xl overflow-hidden p-6 md:p-10 lg:p-12 mb-12 shadow-2xl">
                        {/* Decorative internal glow */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand-yellow/[0.03] to-transparent pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-center">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold text-brand-yellow uppercase tracking-[0.2em]">
                                        <Sparkles className="w-3 h-3" />
                                        Premium Service
                                    </div>
                                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-[1.1] break-words max-w-2xl">
                                        {displayTitle}
                                    </h1>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 md:gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">{t("price")}</span>
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                                                <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                / {intervalLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-10 w-px bg-white/10 hidden md:block" />

                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Timeline</span>
                                        <span className="text-lg md:text-xl font-bold text-white tracking-tight">Rapid Delivery</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-[320px] shrink-0 space-y-4">
                                {service.image ? (
                                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-xl group">
                                        <Image
                                            src={service.image}
                                            alt={displayTitle}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            unoptimized={true}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ) : (
                                    <div className="aspect-square rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                        <Sparkles className="w-16 h-16 text-zinc-800" />
                                    </div>
                                )}

                                <PurchaseButton
                                    serviceId={service.id}
                                    interval={service.interval}
                                    className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-black px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-yellow/20 transition-all hover:scale-[1.02] active:scale-95"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-20">
                        {/* ABOUT SECTION: Centered */}
                        <div className="space-y-6 text-center max-w-3xl mx-auto">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 justify-center">
                                <div className="w-1.5 h-1.5 bg-brand-yellow rounded-full animate-pulse" />
                                {t("about")}
                            </h4>
                            <div
                                className="text-zinc-300 leading-relaxed font-light text-md md:text-xl prose prose-invert max-w-none prose-p:mb-4 prose-strong:text-white prose-strong:font-black"
                                dangerouslySetInnerHTML={{ __html: displayDescription }}
                            />
                        </div>

                        {/* WHAT'S INCLUDED SECTION: Redesigned as Grid */}
                        <div className="space-y-10">
                            <div className="flex flex-col items-center text-center space-y-3">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 justify-center">
                                    <div className="w-1 h-3 bg-brand-yellow rounded-full" />
                                    {t("included")}
                                </h4>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Everything you need to succeed</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayFeatures.map((feature: string, i: number) => (
                                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-brand-yellow/20 transition-all duration-300 group/feat">
                                        <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 group-hover/feat:bg-brand-yellow/20 transition-colors shrink-0">
                                            <Check className="w-3 h-3 text-brand-yellow" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-sm md:text-base text-zinc-200 font-bold leading-tight group-hover/feat:text-white transition-colors block">
                                                {feature.replace(/<[^>]*>?/gm, '')}
                                            </span>
                                            <p className="text-xs text-zinc-500 leading-normal">Premium quality deliverable included as standard in this package.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                    <div className="flex -space-x-2">
                                        {trustedAvatars.length > 0 ? (
                                            trustedAvatars.map((url, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 overflow-hidden relative">
                                                    <Image src={url} alt={`Client ${i}`} fill className="object-cover" unoptimized />
                                                </div>
                                            ))
                                        ) : (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center">
                                                    <Sparkles className="w-3 h-3 text-zinc-600" />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {trustedAvatars.length > 0 ? `Trusted by ${trustedAvatars.length * 10}+ Premium Clients` : "150+ Clients Trusted this service"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
