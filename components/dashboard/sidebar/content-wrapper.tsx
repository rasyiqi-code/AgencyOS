"use client";

import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/shared/utils";
import { useSyncExternalStore } from "react";

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function SidebarContentWrapper({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const collapsed = isClient ? isCollapsed : false;

    return (
        <div
            className={cn(
                "flex flex-col sm:gap-4 transition-all duration-300 ease-in-out min-h-screen",
                collapsed ? "sm:pl-14" : "sm:pl-64"
            )}
        >
            {children}
        </div>
    );
}
