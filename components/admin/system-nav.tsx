"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LayoutGrid, Key, Cloud, DollarSign, TrendingUp, Mail, Share2, Globe, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/shared/utils";

export function SystemNav() {
    const pathname = usePathname();

    const links = [
        {
            href: "/admin/system/settings",
            label: "General Settings",
            icon: LayoutGrid
        },
        {
            href: "/admin/system/payment",
            label: "Payment Details",
            icon: CreditCard
        },
        {
            href: "/admin/system/email",
            label: "Email Service",
            icon: Mail
        },
        {
            href: "/admin/system/keys",
            label: "AI Configuration",
            icon: Key
        },
        {
            href: "/admin/system/storage",
            label: "Cloud Storage",
            icon: Cloud
        },
        {
            href: "/admin/system/pricing",
            label: "Pricing Strategy",
            icon: TrendingUp
        },
        {
            href: "/admin/system/currency",
            label: "Currency Rates",
            icon: DollarSign
        },
        {
            href: "/admin/system/integrations",
            label: "System Integrations",
            icon: Share2
        },
        {
            href: "/admin/system/ai",
            label: "Generative AI",
            icon: Sparkles
        },
        {
            href: "/admin/system/seo",
            label: "SEO / Metadata",
            icon: Globe
        },
        {
            href: "/admin/system/seo/pages",
            label: "Page Manager",
            icon: FileText
        }
    ];

    return (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-medium text-zinc-200 mb-3">Quick Navigation</h3>
            <div className="space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-zinc-500")} />
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
