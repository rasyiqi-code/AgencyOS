"use client";

import { Bonus, Coupon } from "@/lib/shared/types";
import { Gift, Check, ShieldCheck, Download, Package } from "lucide-react";
import * as LucideIcons from "lucide-react";

import { useTranslations } from "next-intl";

interface Product {
    id: string;
    name: string;
    price: number;
    purchaseType: string;
    interval?: string;
    description?: string | null;
    description_id?: string | null;
}

interface DigitalCheckoutSummaryProps {
    product: Product;
    bonuses: Bonus[];
    appliedCoupon: Coupon | null;
}

export function DigitalCheckoutSummary({ product, bonuses }: DigitalCheckoutSummaryProps) {
    const t = useTranslations("Checkout");
    const td = useTranslations("ProductDetail");

    const trustSignals = [
        {
            icon: Download,
            title: td("instantAccess"),
            description: td("instantAccessDesc")
        },
        {
            icon: ShieldCheck,
            title: td("licenseIncluded"),
            description: t("licenseDesc")
        },
        {
            icon: Package,
            title: td("fullSourceCode"),
            description: t("sourceCodeDesc")
        }
    ];

    return (
        <div className="space-y-8">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
                    <p className="text-zinc-400 capitalize">
                        {product.purchaseType === "subscription"
                            ? t("digitalSubscription", { interval: product.interval || "month" })
                            : t("digitalOneTime")}
                    </p>
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    {trustSignals.map((signal, i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 bg-white/5 rounded-lg border border-white/5">
                            <signal.icon className="w-5 h-5 text-lime-400 shrink-0" />
                            <div>
                                <div className="font-medium text-white text-sm">{signal.title}</div>
                                <div className="text-[11px] text-zinc-500">{signal.description}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bonuses */}
                <div className="pt-6 border-t border-white/5">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-400" />
                        {t("bonuses")}
                    </h3>
                    <div className="grid gap-3">
                        {bonuses.length > 0 ? (
                            bonuses.map((bonus, i) => {
                                const iconName = (bonus.icon || "Check") as keyof typeof LucideIcons;
                                const Icon = (LucideIcons[iconName] as unknown as React.ElementType) || Check;
                                return (
                                    <div key={i} className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-5 h-5 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0">
                                            <Icon className="w-3 h-3 text-lime-400" />
                                        </div>
                                        <span className="text-sm">
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

                <SubscriptionDialog context="DIGITAL" />
            </div>
        </div>
    );
}

import { SubscriptionDialog } from "@/components/checkout/subscription-dialog";
