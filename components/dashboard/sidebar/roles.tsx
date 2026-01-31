"use client";

import Link from "next/link";
import { LayoutDashboard, Layers, ShoppingCart, Settings, Package, Mail, Users, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";
import { useSyncExternalStore, type ComponentType } from "react";
import { useTranslations } from "next-intl";

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

import { usePathname } from "next/navigation";

export function SidebarLink({ href, icon: Icon, label }: { href: string; icon: ComponentType<{ className?: string }>; label: string }) {
    const { isCollapsed } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const pathname = usePathname();
    const isActive = pathname === href;

    if (!isClient) return null;

    return (
        <Link
            href={href}
            title={isCollapsed ? label : undefined}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-white/5",
                isActive ? "text-brand-yellow bg-brand-yellow/10" : "text-zinc-400 hover:text-white",
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
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <SidebarSectionHeader>{t("commandCenter")}</SidebarSectionHeader>
            <SidebarLink href="/admin" icon={LayoutDashboard} label={t("overview")} />
            <SidebarLink href="/admin/pm/projects" icon={Layers} label={t("missionBoard")} />
            <SidebarLink href="/admin/finance/orders" icon={ShoppingCart} label={t("orders")} />
            <SidebarLink href="/admin/clients" icon={Users} label={t("clients")} />
            <SidebarLink href="/admin/team" icon={ShieldCheck} label="Team Roles" />
            <SidebarLink href="/admin/support" icon={Mail} label={t("supportInbox")} />
            <SidebarLink href="/admin/marketing" icon={Megaphone} label="Marketing" />
            <SidebarLink href="/admin/changelog" icon={Sparkles} label="Changelog" />
            <SidebarLink href="/admin/system/settings" icon={Settings} label={t("system")} />
            <SidebarLink href="/admin/pm/services" icon={Package} label={t("serviceCatalog")} />
        </>
    );
}

export function SidebarFinance() {
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <SidebarSectionHeader>{t("financeConsole")}</SidebarSectionHeader>
            <SidebarLink href="/admin/finance" icon={LayoutDashboard} label={t("dashboard")} />
            <SidebarLink href="/admin/finance/orders" icon={ShoppingCart} label={t("invoices")} />
        </>
    );
}

export function SidebarPM() {
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <SidebarSectionHeader>{t("projectConsole")}</SidebarSectionHeader>
            <SidebarLink href="/admin/pm" icon={LayoutDashboard} label={t("dashboard")} />
            <SidebarLink href="/admin/pm/projects" icon={Layers} label={t("missionBoard")} />
            <SidebarLink href="/admin/pm/services" icon={Package} label={t("serviceCatalog")} />
        </>
    );
}
