"use client";

import { useState } from "react";
import { ExtendedEstimate } from "@/lib/types";
import { Gift, Zap, Check, ShieldCheck, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CheckoutSummary({ estimate }: { estimate: ExtendedEstimate }) {
    const [coupon, setCoupon] = useState("");
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

    const bonuses = [
        "1 Year Server Maintenance (Worth $500)",
        "Basic SEO Setup (Worth $300)",
        "AgencyOS Dashboard Access",
        "Priority Support (1 Month)"
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
                        Included Bonuses <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1 rounded">(Mock)</span>
                    </h3>
                    <div className="grid gap-3">
                        {bonuses.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-zinc-300">
                                <div className="w-5 h-5 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-lime-400" />
                                </div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-white">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">Have a coupon code? <span className="text-xs text-zinc-500 ml-2">(Mock)</span></span>
                </div>
                <div className="flex gap-4">
                    <Input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter Promo Code"
                        className="bg-zinc-950 border-zinc-800 text-white focus:ring-lime-500/50"
                    />
                    <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    );
}
