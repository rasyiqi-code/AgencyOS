"use client";

import Link from "next/link";
import { LayoutDashboard, Layers, ShoppingCart, Settings, Package, Mail, Users, Megaphone, ShieldCheck, MessageSquare, Images, Key, Bell, Globe, Repeat, Tag, DollarSign, LayoutTemplate, Gift, UserPlus, FolderOpen } from "lucide-react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/shared/utils";
import { useSyncExternalStore, type ComponentType } from "react";
import { useTranslations } from "next-intl";

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

import { usePathname, useSearchParams } from "next/navigation";

export function SidebarLink({ href, icon: Icon, label, iconClass }: { href: string; icon: ComponentType<{ className?: string }>; label: string; iconClass?: string }) {
    const { isCollapsed } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const pathname = usePathname();
    const cleanHrefPath = href.split('?')[0];
    const isActive = pathname === cleanHrefPath || (
        cleanHrefPath !== '/admin' &&
        cleanHrefPath !== '/dashboard' &&
        cleanHrefPath !== '/' &&
        pathname?.startsWith(cleanHrefPath)
    );

    if (!isClient) return null;

    return (
        <Link
            href={href}
            title={isCollapsed ? label : undefined}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-white/5 cursor-pointer",
                isActive ? "text-brand-yellow bg-brand-yellow/10" : "text-zinc-400 hover:text-white",
                isCollapsed ? "justify-center px-2" : ""
            )}
        >
            <Icon className={cn("h-4 w-4 shrink-0", iconClass)} />
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
            {/* Overview utama */}
            <SidebarLink href="/admin" icon={LayoutDashboard} label={t("overview")} />

            {/* 1. OPERASIONAL AGENSI */}
            <SidebarSectionHeader>Agency Ops</SidebarSectionHeader>
            <SidebarLink href="/admin/pm/projects" icon={Layers} label={t("missionBoard")} />
            <SidebarLink href="/admin/pm/services" icon={Package} label={t("serviceCatalog")} />
            <SidebarLink href="/admin/clients" icon={Users} label={t("clients")} />
            <SidebarLink href="/admin/support" icon={Mail} label={t("supportInbox")} />

            {/* 2. KEUANGAN & TRANSAKSI AGENSI */}
            <SidebarSectionHeader>Finance & Billing (Agency)</SidebarSectionHeader>
            <SidebarLink href="/admin/finance/orders" icon={ShoppingCart} label="Client Invoices" />
            <SidebarLink href="/admin/finance/quotes" icon={MessageSquare} label="Quotes & Estimates" />
            <SidebarLink href="/admin/finance/subscriptions" icon={Repeat} label="Subscriptions" />

            {/* 3. PEMASARAN & AUDIENS (SERVICES) */}
            <SidebarSectionHeader>Campaigns & Leads</SidebarSectionHeader>
            <SidebarLink href="/admin/marketing/promotions" icon={Megaphone} label="Visual Promos" />
            <SidebarLink href="/admin/portfolio" icon={Images} label="Portfolio Admin" />
            <SidebarLink href="/admin/testimonials" icon={MessageSquare} label="Testimonials" />
            <SidebarLink href="/admin/marketing/leads" icon={UserPlus} label="Contact Leads" />
            <SidebarLink href="/admin/marketing/subscribers" icon={Mail} label="Newsletter Subs" />

            {/* 4. SISTEM & KONFIGURASI */}
            <SidebarSectionHeader>System & Tools</SidebarSectionHeader>
            <SidebarLink href="/admin/media" icon={Images} label="Media Library" />
            <SidebarLink href="/admin/licenses" icon={Key} label="Licenses" />
            <SidebarLink href="/admin/team" icon={ShieldCheck} label="Team Roles" />
            <SidebarLink href="/admin/system/webhooks" icon={Globe} label="Webhook Simulator" />
            <SidebarLink href="/admin/system/settings" icon={Settings} label={t("system")} />
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
            <SidebarLink href="/admin/finance/quotes" icon={MessageSquare} label="Quotes" />
            <SidebarLink href="/admin/finance/subscriptions" icon={Repeat} label="Subscriptions" />
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
            <SidebarLink href="/admin/media" icon={Images} label="Media" />
        </>
    );
}
