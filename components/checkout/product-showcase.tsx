"use client";

import { useState } from "react";
import { ExtendedEstimate, Bonus, ServiceAddon } from "@/lib/shared/types";
import { Check, ArrowLeft, ShieldCheck, Flame, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface ProductShowcaseProps {
    estimate: ExtendedEstimate;
    bonuses: Bonus[];
    selectedAddons: ServiceAddon[];
    amountToPay: number;
    baseCurrency: "USD" | "IDR";
}

export function ProductShowcase({ estimate, bonuses, selectedAddons, amountToPay, baseCurrency }: ProductShowcaseProps) {
    const t = useTranslations("Checkout");
    const locale = useLocale();
    const isId = locale === 'id';
    const [isExpanded, setIsExpanded] = useState(false);

    // Ambil list deliverables
    const serviceFeatures = isId
        ? (estimate.service?.features_id as string[]) || (estimate.service?.features as string[])
        : (estimate.service?.features as string[]) || [];

    return (
        <div className="space-y-8 flex flex-col justify-between h-full text-white p-6 pl-0 sm:p-8 sm:pl-0 lg:pr-12 lg:py-4 relative overflow-hidden bg-transparent">
            {/* Background glow effects */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 left-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-8 relative z-10">
                {/* Back to dashboard button */}
                <div>
                    <a 
                        href="/client-dashboard" 
                        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-wider group cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        {isId ? "Kembali ke Dashboard" : "Back to Dashboard"}
                    </a>
                </div>

                {/* Branding & Heading */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-[10px] font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Quote
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                        {estimate.title}
                    </h1>
                    
                    <div 
                        className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed max-w-xl prose prose-invert prose-sm"
                        dangerouslySetInnerHTML={{ __html: estimate.summary }}
                    />
                </div>

                {/* Deliverables / Checklist */}
                {serviceFeatures && serviceFeatures.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                            {t("deliverables") || "Fitur & Deliverables"}
                        </span>
                        <div className="grid grid-cols-1 gap-2.5">
                            {(isExpanded ? serviceFeatures : serviceFeatures.slice(0, 4)).map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 group animate-in fade-in duration-300">
                                    <div className="w-5 h-5 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(132,204,22,0.1)]">
                                        <Check className="w-3 h-3 text-lime-400" />
                                    </div>
                                    <span className="text-xs sm:text-sm text-zinc-300 font-semibold tracking-tight leading-relaxed">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                            {serviceFeatures.length > 4 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-xs text-lime-400 hover:text-lime-300 font-bold tracking-wide transition-all duration-300 hover:underline cursor-pointer bg-transparent border-0 p-0 text-left pl-8 flex items-center gap-1 mt-1 group"
                                >
                                    {isExpanded ? (
                                        <>
                                            {isId ? "Sembunyikan rincian" : "Hide details"}
                                            <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                        </>
                                    ) : (
                                        <>
                                            + {serviceFeatures.length - 4} {isId ? "deliverable lainnya" : "more deliverables"} ({isId ? "klik untuk melihat" : "click to view"})
                                            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
