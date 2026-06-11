"use client";

import { ExtendedEstimate, Bonus, ServiceAddon } from "@/lib/shared/types";
import { 
    Gift, Zap, Check, ShieldCheck, Layers, PlusCircle, Download, Flame, Globe, 
    Infinity as InfinityIcon, Star, Crown 
} from "lucide-react";

const IconMap: Record<string, React.ElementType> = {
    Check,
    Gift,
    Zap,
    ShieldCheck,
    Layers,
    PlusCircle,
    Download,
    Flame,
    Globe,
    Infinity: InfinityIcon,
    Star,
    Crown
};


import { useTranslations, useLocale } from "next-intl";

interface CheckoutSummaryProps {
    estimate: ExtendedEstimate;
    bonuses: Bonus[];
    context?: "SERVICE" | "CALCULATOR";
    selectedAddons?: ServiceAddon[];
    onToggleAddon?: (addon: ServiceAddon) => void;
}

export function CheckoutSummary({ estimate, bonuses, context, selectedAddons = [], onToggleAddon }: CheckoutSummaryProps) {
    const t = useTranslations("Checkout");
    const locale = useLocale();
    const isId = locale === 'id';

    // Get features based on locale
    const serviceFeatures = isId
        ? (estimate.service?.features_id as string[]) || (estimate.service?.features as string[])
        : (estimate.service?.features as string[]);

    const serviceAddons = isId
        ? (estimate.service?.addons_id as ServiceAddon[]) || (estimate.service?.addons as ServiceAddon[])
        : (estimate.service?.addons as ServiceAddon[]);

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {/* Accent line at the top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-yellow via-lime-500 to-emerald-500" />
                
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mb-2 break-words tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                        {estimate.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 break-words font-medium leading-relaxed">
                        {estimate.summary}
                    </p>
                </div>

                {/* Deliverables & Features */}
                {serviceFeatures && serviceFeatures.length > 0 && (
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-lime-400" />
                            {t("deliverables")}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {serviceFeatures.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/[0.07] rounded-xl transition-all duration-300 group">
                                    <div className="w-2 h-2 rounded-full bg-lime-500/80 group-hover:scale-125 transition-transform duration-300 shrink-0 shadow-[0_0_8px_rgba(132,204,22,0.4)]" />
                                    <span className="text-xs sm:text-sm text-zinc-300 font-medium tracking-tight group-hover:text-white transition-colors">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add-ons */}
                {serviceAddons && serviceAddons.length > 0 && (
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                            {isId ? "Add-ons Tersedia" : "Available Add-ons"}
                        </h3>
                        <div className="grid grid-cols-1 gap-2.5">
                            {serviceAddons.map((addon, i) => {
                                const isSelected = selectedAddons.some(a => a.name === addon.name);
                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => onToggleAddon && onToggleAddon(addon)}
                                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-300 transform active:scale-[0.99] group ${
                                            isSelected 
                                                ? 'bg-brand-yellow/5 border-brand-yellow/30 shadow-[0_0_15px_rgba(254,215,0,0.05)]' 
                                                : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.08]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                isSelected 
                                                    ? 'bg-brand-yellow border-brand-yellow text-black' 
                                                    : 'border-zinc-600 group-hover:border-zinc-400'
                                            }`}>
                                                {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                                            </div>
                                            <div>
                                                <div className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                                                    isSelected ? 'text-brand-yellow' : 'text-zinc-200 group-hover:text-white'
                                                }`}>
                                                    {addon.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-mono font-bold text-zinc-400">
                                                {addon.currency === 'IDR' ? 'Rp' : '$'} {addon.price.toLocaleString()}
                                            </span>
                                            {addon.interval && (
                                                <span className="text-[10px] text-zinc-500 font-medium ml-1">
                                                    {addon.interval === 'monthly' ? '/bln' : addon.interval === 'yearly' ? '/thn' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bonuses */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5 text-purple-400" />
                        {t("bonuses")}
                    </h3>
                    <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-2xl p-5 space-y-3.5">
                        {bonuses.length > 0 ? (
                            bonuses.map((bonus, i) => {
                                const iconName = bonus.icon || "Check";
                                const Icon = IconMap[iconName] || Check;
                                return (
                                    <div key={i} className="flex items-center gap-3.5 group">
                                        <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                                            <Icon className="w-3.5 h-3.5 text-purple-400" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-white transition-colors tracking-tight">
                                                {bonus.title}
                                            </span>
                                            {bonus.value && (
                                                <span className="text-[10px] text-purple-400/80 font-bold font-mono tracking-tight animate-pulse">
                                                    Worth {bonus.value}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-zinc-500 italic text-center py-2">{t("noBonuses")}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
