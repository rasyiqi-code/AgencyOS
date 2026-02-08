"use client";

import { Activity, Code2, Shield } from "lucide-react";
import { SidebarLink, SidebarSectionHeader } from "@/components/dashboard/sidebar/roles";

export function SquadSidebarNavigation() {
    return (
        <>
            <SidebarSectionHeader>Squad Protocol</SidebarSectionHeader>
            <SidebarLink href="/squad" icon={Code2} label="Mission Board" />
            <SidebarLink href="/squad/active" icon={Activity} label="Active Protocol" />

            <SidebarLink href="/squad/profile" icon={Shield} label="Operative Data" />
        </>
    );
}
