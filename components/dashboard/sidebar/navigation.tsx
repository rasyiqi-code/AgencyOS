"use client";

import { LayoutDashboard, Settings, Rocket, Sparkles, LifeBuoy, Receipt, MessageSquare } from "lucide-react";
import { SidebarLink, SidebarSectionHeader } from "./roles";
import { useTranslations } from "next-intl";

export function DashboardSidebarNavigation() {
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <SidebarSectionHeader>{t("platform")}</SidebarSectionHeader>
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label={t("dashboard")} />

            <SidebarSectionHeader>Operations</SidebarSectionHeader>
            <SidebarLink href="/dashboard/missions" icon={Rocket} label={t("missions")} />
            <SidebarLink href="/dashboard/billing" icon={Receipt} label={t("billing")} />

            <SidebarSectionHeader>Digital Services</SidebarSectionHeader>
            <SidebarLink href="/dashboard/services" icon={Sparkles} label={t("store")} />

            <SidebarSectionHeader>Support & Feedback</SidebarSectionHeader>
            <SidebarLink href="/dashboard/support" icon={LifeBuoy} label={t("support")} />
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
