"use client";

import { ExtendedEstimate, ServiceAddon } from "@/lib/shared/types";
import { Check, ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { cleanSummaryText } from "@/lib/shared/utils";

interface ProductShowcaseProps {
    estimate: ExtendedEstimate;
    selectedAddons?: ServiceAddon[];
}

export function ProductShowcase({ estimate, selectedAddons = [] }: ProductShowcaseProps) {
    const t = useTranslations("Checkout");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const isId = locale === 'id';
    // Ambil list deliverables
    const serviceFeatures = isId
        ? (estimate.service?.features_id as string[]) || (estimate.service?.features as string[])
        : (estimate.service?.features as string[]) || [];

    // Tentukan URL kembali ke halaman detail service
    const serviceSlug = estimate.service?.slug || estimate.serviceId;
    const backUrl = serviceSlug ? `/services/${serviceSlug}` : "/client-dashboard";

    return (
        <div className="space-y-8 flex flex-col justify-between h-full text-white p-6 pl-0 sm:p-8 sm:pl-0 lg:pr-12 lg:py-4 relative overflow-hidden bg-transparent">
            {/* Background glow effects */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 left-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-8 relative z-10">
                {/* Back to button */}
                <div className="mb-4">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-wider group cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        {tCommon("back")}
                    </Link>
                </div>

                {/* Branding & Heading */}
                <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                        {estimate.title}
                    </h1>

                    {(() => {
                        const cleanSummary = cleanSummaryText(estimate.summary);
                        return (
                            <div
                                className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed max-w-xl prose prose-invert prose-sm"
                                dangerouslySetInnerHTML={{ __html: cleanSummary }}
                            />
                        );
                    })()}
                </div>

                {/* Deliverables & Add-ons Grid (Berdampingan secara horizontal) */}
                {((serviceFeatures && serviceFeatures.length > 0) || (selectedAddons && selectedAddons.length > 0)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                        {/* Kolom Kiri: Fitur & Deliverables */}
                        {serviceFeatures && serviceFeatures.length > 0 && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                                    {t("deliverables") || "Fitur & Deliverables"}
                                </span>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {serviceFeatures.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 group animate-in fade-in duration-300">
                                            <div className="w-5 h-5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(254,215,0,0.1)]">
                                                <Check className="w-3 h-3 text-brand-yellow" />
                                            </div>
                                            <span className="text-xs sm:text-sm text-zinc-300 font-semibold tracking-tight leading-relaxed">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Kolom Kanan: Add-on Terpilih */}
                        {selectedAddons && selectedAddons.length > 0 && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold text-brand-yellow uppercase tracking-widest block">
                                    {t("selectedAddons")}
                                </span>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {selectedAddons.map((addon, i) => (
                                        <div key={`selected-addon-${i}`} className="flex items-start gap-3 group animate-in fade-in duration-300">
                                            <div className="w-5 h-5 rounded-full bg-brand-yellow/20 border border-brand-yellow/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(254,215,0,0.2)]">
                                                <Check className="w-3 h-3 text-brand-yellow" />
                                            </div>
                                            <span className="text-xs sm:text-sm text-zinc-200 font-bold tracking-tight leading-relaxed flex items-center gap-2">
                                                {addon.name}
                                                <span className="text-[8px] bg-brand-yellow/15 border border-brand-yellow/30 text-brand-yellow px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider scale-90">
                                                    Add-on
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
