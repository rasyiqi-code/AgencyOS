"use client";

import { useState } from "react";
import { ExtendedEstimate, Bonus, Coupon } from "@/lib/types";
import { Gift, Zap, Check, ShieldCheck, Tag, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { SubscriptionDialog } from "@/components/checkout/subscription-dialog";

interface CheckoutSummaryProps {
    estimate: ExtendedEstimate;
    bonuses: Bonus[];
    onApplyCoupon: (coupon: Coupon | null) => void;
    appliedCoupon: Coupon | null;
}

export function CheckoutSummary({ estimate, bonuses, onApplyCoupon, appliedCoupon }: CheckoutSummaryProps) {
    const [couponInput, setCouponInput] = useState("");
    const [isValidating, setIsValidating] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setIsValidating(true);
        try {
            const response = await fetch('/api/marketing/coupon/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponInput })
            });

            const result = await response.json();

            if (result.valid) {
                onApplyCoupon((result.coupon as Coupon) || null);
                toast.success("Coupon applied successfully!");
            } else {
                toast.error(result.message || "Invalid coupon");
                onApplyCoupon(null);
            }
        } catch {
            toast.error("Failed to validate coupon");
        } finally {
            setIsValidating(false);
        }
    };

    const salesPoints = [
        {
            icon: ShieldCheck,
            title: "Money Back Guarantee",
            description: "14-day revisions period included"
        },
        {
            icon: Zap,
            title: "Fast Delivery",
            description: `Estimated ${Math.ceil(estimate.totalHours / 6)} days turnaround`
        }
    ];

    return (
        <div className="space-y-8">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{estimate.title}</h2>
                    <p className="text-zinc-400">{estimate.summary}</p>
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

                {/* Bonuses */}
                <div className="pt-6 border-t border-white/5">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-400" />
                        Included Bonuses
                    </h3>
                    <div className="grid gap-3">
                        {bonuses.length > 0 ? (
                            bonuses.map((bonus, i) => {
                                // Dynamic Bonus Icon
                                const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[bonus.icon] || Check;
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
                            <p className="text-sm text-zinc-500 italic">No marketing bonuses active.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-white">
                    <Tag className="w-4 h-4 text-brand-yellow" />
                    <span className="font-medium">Have a coupon code?</span>
                </div>
                <div className="flex gap-4">
                    <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter Promo Code"
                        className="bg-zinc-950 border-zinc-800 text-white focus:ring-brand-yellow/50 uppercase"
                        disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                        <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white" onClick={() => {
                            setCouponInput("");
                            onApplyCoupon(null);
                        }}>
                            Change
                        </Button>
                    ) : (
                        <Button
                            className="bg-brand-yellow text-black hover:bg-brand-yellow/80"
                            onClick={handleApplyCoupon}
                            disabled={isValidating || !couponInput}
                        >
                            {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                        </Button>
                    )}
                </div>
                {appliedCoupon && (
                    <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Coupon applied: {appliedCoupon.code} ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `$${appliedCoupon.discountValue} OFF`})
                    </div>
                )}
            </div>

            <SubscriptionDialog />
        </div>
    );
}
