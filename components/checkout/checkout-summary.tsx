"use client";

import { ExtendedEstimate, Bonus, ServiceAddon } from "@/lib/shared/types";
import { Gift, Zap, Check, ShieldCheck } from "lucide-react";
import * as LucideIcons from "lucide-react";


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

    const estimatedDays = Math.ceil(estimate.totalHours / 6);
    const salesPoints = [
        {
            icon: ShieldCheck,
            title: t("riskFree"),
            description: t("refundable")
        },
        {
            icon: Zap,
            title: t("fastDelivery"),
            description: (!estimate.serviceId || context === "CALCULATOR") && estimatedDays > 0
                ? t("turnaround", { days: estimatedDays })
                : t("fastTurnaroundDesc")
        }
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">{estimate.title}</h2>
                    <p className="text-sm sm:text-base text-zinc-400 break-words">{estimate.summary}</p>
                </div>

                {/* Sales Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {salesPoints.map((point, i) => (
                        <div key={i} className="flex gap-3 items-start p-4 bg-white/5 rounded-lg border border-white/5">
                            <point.icon className="w-5 h-5 text-lime-400 mt-1 shrink-0" />
                            <div>
                                <div className="font-medium text-white">{point.title}</div>
                                <div className="text-sm text-zinc-500">{point.description}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Deliverables & Features */}
                {serviceFeatures && serviceFeatures.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <LucideIcons.Layers className="w-4 h-4 text-lime-400" />
                            {t("deliverables")}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                            {serviceFeatures.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 text-zinc-300">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0" />
                                    <span className="text-sm leading-relaxed">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add-ons */}
                {serviceAddons && serviceAddons.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <LucideIcons.PlusCircle className="w-4 h-4 text-blue-400" />
                            {isId ? "Add-ons Tersedia" : "Available Add-ons"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                            {serviceAddons.map((addon, i) => {
                                const isSelected = selectedAddons.some(a => a.name === addon.name);
                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => onToggleAddon && onToggleAddon(addon)}
                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-brand-yellow/10 border-brand-yellow/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className={`mt-1 w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-brand-yellow border-brand-yellow' : 'border-zinc-500'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-black" />}
                                        </div>
                                        <div>
                                            <div className={`text-sm font-medium ${isSelected ? 'text-brand-yellow' : 'text-zinc-200'}`}>{addon.name}</div>
                                            <div className="text-xs text-zinc-500 mt-0.5">
                                                {addon.currency} {addon.price.toLocaleString()} {addon.interval === 'monthly' ? '/ bln' : addon.interval === 'yearly' ? '/ thn' : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bonuses */}
                <div className="pt-6 border-t border-white/5">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-400" />
                        {t("bonuses")}
                    </h3>
                    <div className="grid gap-3">
                        {bonuses.length > 0 ? (
                            bonuses.map((bonus, i) => {
                                // Dynamic Bonus Icon
                                const iconName = (bonus.icon || "Check") as keyof typeof LucideIcons;
                                const Icon = (LucideIcons[iconName] as unknown as React.ElementType) || Check;
                                return (
                                    <div key={i} className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-5 h-5 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0">
                                            <Icon className="w-3 h-3 text-lime-400" />
                                        </div>
                                        <span>
                                            {bonus.title}
                                            {bonus.value && <span className="text-zinc-500 ml-1">({bonus.value})</span>}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-zinc-500 italic">{t("noBonuses")}</p>
                        )}
                    </div>
                </div>

                <SubscriptionDialog context={context === "CALCULATOR" ? "CALCULATOR" : "SERVICE"} />
            </div>
        </div>
    );
}

import { SubscriptionDialog } from "@/components/checkout/subscription-dialog";
