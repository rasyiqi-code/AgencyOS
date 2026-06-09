"use client";

import Link from "next/link";
import { LayoutDashboard, Layers, ShoppingCart, Settings, Package, Mail, Users, Megaphone, ShieldCheck, MessageSquare, Images, Code, Key, Bell, Globe, Repeat } from "lucide-react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/shared/utils";
import { useSyncExternalStore, type ComponentType } from "react";
import { useTranslations } from "next-intl";

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

import { usePathname } from "next/navigation";

export function SidebarLink({ href, icon: Icon, label, iconClass }: { href: string; icon: ComponentType<{ className?: string }>; label: string; iconClass?: string }) {
    const { isCollapsed } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const pathname = usePathname();
    const isActive = pathname === href || (
        href !== '/admin' &&
        href !== '/dashboard' &&
        href !== '/' &&
        pathname?.startsWith(href)
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
            <SidebarLink href="/admin/team" icon={ShieldCheck} label="Team Roles" />
            <SidebarLink href="/admin/squad" icon={Code} label="Squad Network" iconClass="text-brand-yellow" />
            <SidebarLink href="/admin/support" icon={Mail} label={t("supportInbox")} />

            {/* 2. KEUANGAN & TRANSAKSI */}
            <SidebarSectionHeader>Finance & Billing</SidebarSectionHeader>
            <SidebarLink href="/admin/finance/orders" icon={ShoppingCart} label="Client Invoices" />
            <SidebarLink href="/admin/finance/quotes" icon={MessageSquare} label="Quotes & Estimates" />
            <SidebarLink href="/admin/finance/subscriptions" icon={Repeat} label="Subscriptions" />
            <SidebarLink href="/admin/finance/digital-orders" icon={ShoppingCart} label="Digital Orders" />

            {/* 3. PENJUALAN DIGITAL & PEMASARAN */}
            <SidebarSectionHeader>Marketing & Products</SidebarSectionHeader>
            <SidebarLink href="/admin/marketing" icon={Megaphone} label="Marketing Suite" />
            <SidebarLink href="/admin/products" icon={Package} label="DigiProducts" />
            <SidebarLink href="/admin/digital-sales" icon={LayoutDashboard} label="Digital Sales" />
            <SidebarLink href="/admin/licenses" icon={Key} label="Licenses" />
            <SidebarLink href="/admin/portfolio" icon={Images} label="Portfolio Admin" />
            <SidebarLink href="/admin/testimonials" icon={MessageSquare} label="Testimonials" />

            {/* 4. SISTEM & KONFIGURASI */}
            <SidebarSectionHeader>System & Tools</SidebarSectionHeader>
            <SidebarLink href="/admin/media" icon={Images} label="Media Library" />
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
            <SidebarLink href="/admin/finance/digital-orders" icon={ShoppingCart} label="Digital Orders" />
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
