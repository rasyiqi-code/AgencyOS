"use client";

import Link from "next/link";
import { LayoutDashboard, Layers, ShoppingCart, Settings, Package, Mail, Users, Megaphone, ShieldCheck, MessageSquare, Images, Code, Key, Bell, Globe, Repeat, Tag, DollarSign, LayoutTemplate, Gift, UserPlus, FolderOpen } from "lucide-react";
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
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Tentukan mode berdasarkan searchParams, dengan fallback cerdas berbasis rute aktif
    let mode = searchParams.get("mode");
    if (!mode) {
        const cleanPath = pathname.replace(/^\/(en|id)/, "");
        if (
            cleanPath.startsWith("/admin/products") ||
            cleanPath.startsWith("/admin/digital-sales") ||
            cleanPath.startsWith("/admin/licenses") ||
            cleanPath.startsWith("/admin/finance/digital-orders") ||
            cleanPath.startsWith("/admin/portfolio") ||
            cleanPath.startsWith("/admin/marketing") ||
            cleanPath.startsWith("/admin/testimonials")
        ) {
            mode = "digital";
        } else {
            mode = "services";
        }
    }

    const isDigital = mode === "digital";

    return (
        <>
            {/* Overview utama */}
            <SidebarLink href={isDigital ? "/admin?mode=digital" : "/admin?mode=services"} icon={LayoutDashboard} label={t("overview")} />

            {isDigital ? (
                <>
                    {/* KEUANGAN & TRANSAKSI DIGITAL */}
                    <SidebarSectionHeader>Finance & Billing (Digital)</SidebarSectionHeader>
                    <SidebarLink href="/admin/finance/digital-orders?mode=digital" icon={ShoppingCart} label="Digital Orders" />
                    <SidebarLink href="/admin/digital-sales?mode=digital" icon={LayoutDashboard} label="Digital Sales" />

                    {/* CAMPAIGNS & PROMOTIONS */}
                    <SidebarSectionHeader>Campaigns & Promos</SidebarSectionHeader>
                    <SidebarLink href="/admin/marketing/promotions?mode=digital" icon={Megaphone} label="Visual Promos" />
                    <SidebarLink href="/admin/marketing/popups?mode=digital" icon={LayoutTemplate} label="PopUp Banners" />
                    <SidebarLink href="/admin/marketing/push?mode=digital" icon={Bell} label="Push Center" />
                    <SidebarLink href="/admin/portfolio?mode=digital" icon={Images} label="Portfolio Admin" />
                    <SidebarLink href="/admin/testimonials?mode=digital" icon={MessageSquare} label="Testimonials" />

                    {/* DISCOUNTS & OFFERS */}
                    <SidebarSectionHeader>Discounts & Offers</SidebarSectionHeader>
                    <SidebarLink href="/admin/marketing/coupons?mode=digital" icon={Tag} label="Coupon Codes" />
                    <SidebarLink href="/admin/marketing/bonuses?mode=digital" icon={Gift} label="Checkout Bonuses" />

                    {/* AUDIENCE & LEADS */}
                    <SidebarSectionHeader>Audience & Leads</SidebarSectionHeader>
                    <SidebarLink href="/admin/marketing/leads?mode=digital" icon={UserPlus} label="Contact Leads" />
                    <SidebarLink href="/admin/marketing/subscribers?mode=digital" icon={Mail} label="Newsletter Subs" />

                    {/* AFFILIATE NETWORK */}
                    <SidebarSectionHeader>Affiliate Network</SidebarSectionHeader>
                    <SidebarLink href="/admin/marketing/affiliates?mode=digital" icon={Users} label="Affiliate Partners" />
                    <SidebarLink href="/admin/marketing/payouts?mode=digital" icon={DollarSign} label="Payout Requests" />
                    <SidebarLink href="/admin/marketing/assets?mode=digital" icon={FolderOpen} label="Marketing Assets" />

                    {/* DIGITAL PRODUCTS */}
                    <SidebarSectionHeader>Digital Products</SidebarSectionHeader>
                    <SidebarLink href="/admin/products?mode=digital" icon={Package} label="DigiProducts" />
                    <SidebarLink href="/admin/licenses?mode=digital" icon={Key} label="Licenses" />
                </>
            ) : (
                <>
                    {/* 1. OPERASIONAL AGENSI */}
                    <SidebarSectionHeader>Agency Ops</SidebarSectionHeader>
                    <SidebarLink href="/admin/pm/projects?mode=services" icon={Layers} label={t("missionBoard")} />
                    <SidebarLink href="/admin/pm/services?mode=services" icon={Package} label={t("serviceCatalog")} />
                    <SidebarLink href="/admin/clients?mode=services" icon={Users} label={t("clients")} />
                    <SidebarLink href="/admin/squad?mode=services" icon={Code} label="Squad Network" iconClass="text-brand-yellow" />
                    <SidebarLink href="/admin/support?mode=services" icon={Mail} label={t("supportInbox")} />

                    {/* 2. KEUANGAN & TRANSAKSI AGENSI */}
                    <SidebarSectionHeader>Finance & Billing (Agency)</SidebarSectionHeader>
                    <SidebarLink href="/admin/finance/orders?mode=services" icon={ShoppingCart} label="Client Invoices" />
                    <SidebarLink href="/admin/finance/quotes?mode=services" icon={MessageSquare} label="Quotes & Estimates" />
                    <SidebarLink href="/admin/finance/subscriptions?mode=services" icon={Repeat} label="Subscriptions" />

                    {/* 3. PEMASARAN & AUDIENS (SERVICES) */}
                    <SidebarSectionHeader>Campaigns & Leads</SidebarSectionHeader>
                    <SidebarLink href="/admin/marketing/promotions?mode=services" icon={Megaphone} label="Visual Promos" />
                    <SidebarLink href="/admin/portfolio?mode=services" icon={Images} label="Portfolio Admin" />
                    <SidebarLink href="/admin/testimonials?mode=services" icon={MessageSquare} label="Testimonials" />
                    <SidebarLink href="/admin/marketing/leads?mode=services" icon={UserPlus} label="Contact Leads" />
                    <SidebarLink href="/admin/marketing/subscribers?mode=services" icon={Mail} label="Newsletter Subs" />
                </>
            )}

            {/* 4. SISTEM & KONFIGURASI */}
            <SidebarSectionHeader>System & Tools</SidebarSectionHeader>
            <SidebarLink href={isDigital ? "/admin/media?mode=digital" : "/admin/media?mode=services"} icon={Images} label="Media Library" />
            <SidebarLink href={isDigital ? "/admin/team?mode=digital" : "/admin/team?mode=services"} icon={ShieldCheck} label="Team Roles" />
            <SidebarLink href={isDigital ? "/admin/system/webhooks?mode=digital" : "/admin/system/webhooks?mode=services"} icon={Globe} label="Webhook Simulator" />
            <SidebarLink href={isDigital ? "/admin/system/settings?mode=digital" : "/admin/system/settings?mode=services"} icon={Settings} label={t("system")} />
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
