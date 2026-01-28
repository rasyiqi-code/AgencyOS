"use client";

import { LayoutDashboard, Settings, Inbox, Rocket, Sparkles, LifeBuoy, Receipt } from "lucide-react";
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
        </>
    );
}

export function DashboardSidebarFooter() {
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <div className="w-full px-2 mb-4 group-data-[collapsed=true]:hidden">
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-indigo-500/10">
                    <h4 className="text-xs font-semibold text-indigo-400 mb-1">{t("proPlan")}</h4>
                    <p className="text-[10px] text-zinc-400 mb-3">{t("upgradeDesc")}</p>
                    <button className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-md transition-colors">
                        {t("upgrade")}
                    </button>
                </div>
            </div>
            <SidebarLink href="/dashboard/settings" icon={Settings} label={t("settings")} />
        </>
    );
}
