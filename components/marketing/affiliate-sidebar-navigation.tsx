"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/shared/utils";

const items = [
    {
        title: "Overview",
        href: "/affiliate/dashboard",
        icon: LayoutDashboard // React node or Lucide Icon
    },
    {
        title: "Payouts",
        href: "/affiliate/payouts",
        icon: Wallet
    },
    {
        title: "Marketing Kit",
        href: "/affiliate/resources",
        icon: LifeBuoy
    },
    // Add more items as needed
];

export function AffiliateSidebarNavigation() {
    const pathname = usePathname();

    return (
        <nav className="grid items-start gap-2 text-sm font-medium lg:px-4">
            {items.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={index}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            isActive ? "bg-muted text-primary" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
