"use client";

import Link from "next/link";
import { LayoutDashboard, Layers, ShoppingCart, Settings, Package, Mail } from "lucide-react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";
import { useSyncExternalStore, type ComponentType } from "react";

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function SidebarLink({ href, icon: Icon, label }: { href: string; icon: ComponentType<{ className?: string }>; label: string }) {
    const { isCollapsed } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    if (!isClient) return null;

    return (
        <Link
            href={href}
            title={isCollapsed ? label : undefined}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:text-white hover:bg-white/5",
                isCollapsed ? "justify-center px-2" : ""
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

export function SidebarSectionHeader({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    if (!isClient || isCollapsed) return <div className="h-4" />;

    return (
        <div className="px-3 mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            {children}
        </div>
    );
}

export function SidebarSuperAdmin() {
    return (
        <>
            <SidebarSectionHeader>Command Center</SidebarSectionHeader>
            <SidebarLink href="/admin" icon={LayoutDashboard} label="Overview" />
            <SidebarLink href="/admin/pm/projects" icon={Layers} label="Mission Board" />
            <SidebarLink href="/admin/finance/orders" icon={ShoppingCart} label="Orders" />
            <SidebarLink href="/admin/support" icon={Mail} label="Support Inbox" />
            <SidebarLink href="/admin/system/settings" icon={Settings} label="System" />
            <SidebarLink href="/admin/pm/services" icon={Package} label="Service Catalog" />
        </>
    );
}

export function SidebarFinance() {
    return (
        <>
            <SidebarSectionHeader>Finance Console</SidebarSectionHeader>
            <SidebarLink href="/admin/finance" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/admin/finance/orders" icon={ShoppingCart} label="Orders & Invoices" />
        </>
    );
}

export function SidebarPM() {
    return (
        <>
            <SidebarSectionHeader>Project Console</SidebarSectionHeader>
            <SidebarLink href="/admin/pm" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/admin/pm/projects" icon={Layers} label="Mission Board" />
            <SidebarLink href="/admin/pm/services" icon={Package} label="Service Catalog" />
        </>
    );
}
