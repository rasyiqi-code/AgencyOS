"use client";

import { useState } from "react";
import { Bonus, Coupon } from "@/lib/shared/types";
import { Gift, Check, ShieldCheck, Tag, Loader2, Download, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { SubscriptionDialog } from "@/components/checkout/subscription-dialog";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { useTranslations } from "next-intl";

interface Product {
    id: string;
    name: string;
    price: number;
    purchaseType: string;
    interval?: string;
}

interface DigitalCheckoutSummaryProps {
    product: Product;
    bonuses: Bonus[];
    onApplyCoupon: (coupon: Coupon | null) => void;
    appliedCoupon: Coupon | null;
}

export function DigitalCheckoutSummary({ product, bonuses, onApplyCoupon, appliedCoupon }: DigitalCheckoutSummaryProps) {
    const t = useTranslations("Checkout");
    const td = useTranslations("ProductDetail");
    const [couponInput, setCouponInput] = useState("");
    const [isValidating, setIsValidating] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setIsValidating(true);
        try {
            const response = await fetch('/api/marketing/coupon/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponInput, context: "DIGITAL" })
            });

            const result = await response.json();

            if (result.valid) {
                onApplyCoupon((result.coupon as Coupon) || null);
                toast.success(t("couponApplied"));
            } else {
                toast.error(result.message || t("invalidCoupon"));
                onApplyCoupon(null);
            }
        } catch {
            toast.error(t("validateError"));
        } finally {
            setIsValidating(false);
        }
    };

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
            </div>

            {/* Coupon Section */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-white">
                    <Tag className="w-4 h-4 text-brand-yellow" />
                    <span className="font-medium">{t("haveCoupon")}</span>
                </div>
                <div className="flex gap-4">
                    <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder={t("enterCode")}
                        className="bg-zinc-950 border-zinc-800 text-white focus:ring-brand-yellow/50 uppercase"
                        disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                        <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white" onClick={() => {
                            setCouponInput("");
                            onApplyCoupon(null);
                        }}>
                            {t("change")}
                        </Button>
                    ) : (
                        <Button
                            className="bg-brand-yellow text-black hover:bg-brand-yellow/80"
                            onClick={handleApplyCoupon}
                            disabled={isValidating || !couponInput}
                        >
                            {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("apply")}
                        </Button>
                    )}
                </div>
                {appliedCoupon && (
                    <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {t("applied")}: {t.rich("appliedCouponDesc", {
                            code: appliedCoupon.code,
                            discount: () => appliedCoupon.discountType === 'percentage'
                                ? `${appliedCoupon.discountValue}%`
                                : <PriceDisplay amount={appliedCoupon.discountValue} />
                        })}
                    </div>
                )}
            </div>

            <SubscriptionDialog context="DIGITAL" />
        </div>
    );
}
