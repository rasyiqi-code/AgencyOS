"use client";

import { LayoutDashboard, Settings, Inbox, Rocket, Sparkles, LifeBuoy } from "lucide-react";
import { SidebarLink, SidebarSectionHeader } from "./sidebar-roles";

export function DashboardSidebarNavigation() {
    return (
        <>
            <SidebarSectionHeader>Platform</SidebarSectionHeader>
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/dashboard/missions" icon={Rocket} label="Missions" />
            <SidebarLink href="/dashboard/inbox" icon={Inbox} label="Inbox" />
            <SidebarLink href="/dashboard/support" icon={LifeBuoy} label="Support" />
            <SidebarLink href="/dashboard/services" icon={Sparkles} label="Store" />
        </>
    );
}

export function DashboardSidebarFooter() {
    return (
        <>
            <div className="w-full px-2 mb-4 group-data-[collapsed=true]:hidden">
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-indigo-500/10">
                    <h4 className="text-xs font-semibold text-indigo-400 mb-1">Pro Plan</h4>
                    <p className="text-[10px] text-zinc-400 mb-3">Upgrade for more AI tokens.</p>
                    <button className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-md transition-colors">
                        Upgrade
                    </button>
                </div>
            </div>
            <SidebarLink href="/dashboard/settings" icon={Settings} label="Settings" />
        </>
    );
}
