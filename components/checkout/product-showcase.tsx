"use client";

import { ExtendedEstimate, Bonus, ServiceAddon } from "@/lib/shared/types";
import { Check, Star, ArrowLeft, TrendingUp, MessageSquare, ShieldCheck, Flame } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface ProductShowcaseProps {
    estimate: ExtendedEstimate;
    bonuses: Bonus[];
    selectedAddons: ServiceAddon[];
}

export function ProductShowcase({ estimate, bonuses, selectedAddons }: ProductShowcaseProps) {
    const t = useTranslations("Checkout");
    const locale = useLocale();
    const isId = locale === 'id';

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
                            {serviceFeatures.slice(0, 4).map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 group">
                                    <div className="w-5 h-5 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(132,204,22,0.1)]">
                                        <Check className="w-3 h-3 text-lime-400" />
                                    </div>
                                    <span className="text-xs sm:text-sm text-zinc-300 font-semibold tracking-tight leading-relaxed">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                            {serviceFeatures.length > 4 && (
                                <span className="text-xs text-zinc-500 font-bold tracking-tight pl-8">
                                    + {serviceFeatures.length - 4} {isId ? "deliverable lainnya" : "more deliverables"} (lihat di detail rincian)
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Premium HTML Mockup: Agency OS Dashboard Preview */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-4 hover:border-white/10 transition-all duration-300 shadow-[0_12px_24px_rgba(0,0,0,0.3)] backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
                    
                    {/* Mockup Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono tracking-tight group-hover:text-zinc-500 transition-colors">agencyos-portal.app</span>
                    </div>

                    {/* Mockup Body Content */}
                    <div className="grid grid-cols-12 gap-3">
                        {/* Diagram Trend */}
                        <div className="col-span-7 bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between min-h-[120px]">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-lime-400" />
                                    Growth Rate
                                </span>
                                <span className="text-[10px] text-lime-400 font-bold">+28.4%</span>
                            </div>
                            
                            {/* Line Chart Mockup */}
                            <div className="h-10 flex items-end gap-1.5 pt-2">
                                <div className="w-full bg-lime-500/10 rounded-sm h-[30%] group-hover:bg-lime-500/20 transition-all duration-500" />
                                <div className="w-full bg-lime-500/10 rounded-sm h-[45%] group-hover:bg-lime-500/20 transition-all duration-500" />
                                <div className="w-full bg-lime-500/15 rounded-sm h-[35%] group-hover:bg-lime-500/25 transition-all duration-500" />
                                <div className="w-full bg-lime-500/20 rounded-sm h-[60%] group-hover:bg-lime-500/30 transition-all duration-500" />
                                <div className="w-full bg-lime-500/30 rounded-sm h-[50%] group-hover:bg-lime-500/40 transition-all duration-500" />
                                <div className="w-full bg-gradient-to-t from-lime-500 to-emerald-500 rounded-sm h-[90%] shadow-[0_0_8px_rgba(132,204,22,0.4)]" />
                            </div>
                        </div>

                        {/* Obrolan Team Mockup */}
                        <div className="col-span-5 bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between min-h-[120px]">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                                <MessageSquare className="w-3 h-3 text-blue-400" />
                                Tim Project
                            </span>
                            <div className="space-y-2">
                                <div className="bg-white/5 rounded-lg p-1.5 text-[9px] leading-tight max-w-[90%]">
                                    <span className="text-zinc-500 block font-bold text-[8px] mb-0.5">PM Agensi</span>
                                    Memulai setup proyek...
                                </div>
                                <div className="bg-lime-500/10 rounded-lg p-1.5 text-[9px] leading-tight max-w-[90%] ml-auto text-right">
                                    <span className="text-lime-400 block font-bold text-[8px] mb-0.5">Klien (Anda)</span>
                                    Terima kasih!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Showcase Footer (Rating & Payment Methods) */}
            <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Rating Trustpilot */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-zinc-400">
                            4.9/5 {isId ? "Rating Kepuasan Klien" : "Client Satisfaction Rating"}
                        </span>
                    </div>

                    {/* Payment Logos */}
                    <div className="flex items-center gap-2 opacity-30">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 mr-1">Payments</span>
                        <div className="px-1.5 py-0.5 border border-white/10 rounded font-mono text-[8px] font-bold">VISA</div>
                        <div className="px-1.5 py-0.5 border border-white/10 rounded font-mono text-[8px] font-bold">MC</div>
                        <div className="px-1.5 py-0.5 border border-white/10 rounded font-mono text-[8px] font-bold">GPAY</div>
                        <div className="px-1.5 py-0.5 border border-white/10 rounded font-mono text-[8px] font-bold">APPLE PAY</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
