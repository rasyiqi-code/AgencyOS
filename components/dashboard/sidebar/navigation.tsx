"use client";

import { LayoutDashboard, Settings, Inbox, Rocket, Sparkles, LifeBuoy, Receipt, MessageSquare, Package } from "lucide-react";
import { SidebarLink, SidebarSectionHeader } from "./roles";
import { useTranslations } from "next-intl";

export function DashboardSidebarNavigation() {
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <SidebarSectionHeader>{t("platform")}</SidebarSectionHeader>
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label={t("dashboard")} />
            <SidebarLink href="/dashboard/missions" icon={Rocket} label={t("missions")} />
            <SidebarLink href="/dashboard/inbox" icon={Inbox} label={t("inbox")} />
            <SidebarLink href="/dashboard/support" icon={LifeBuoy} label={t("support")} />
            <SidebarLink href="/dashboard/services" icon={Sparkles} label={t("store")} />
            <SidebarLink href="/dashboard/billing" icon={Receipt} label={t("billing")} />
            <SidebarLink href="/dashboard/my-products" icon={Package} label="My Products" />
            <SidebarLink href="/submit-testimonial" icon={MessageSquare} label="Give Feedback" />
        </>
    );
}

export function DashboardSidebarFooter() {
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <SidebarLink href="/dashboard/settings" icon={Settings} label={t("settings")} />
        </>
    );
}
