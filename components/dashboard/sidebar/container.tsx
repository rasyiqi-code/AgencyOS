"use client";

import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/shared/utils";
import { useSyncExternalStore } from "react";
import { SidebarToggle } from "./toggle";

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface SidebarContainerProps {
    children: React.ReactNode;
    header: React.ReactNode;
    footer: React.ReactNode;
}

export function SidebarContainer({ children, header, footer }: SidebarContainerProps) {
    const { isCollapsed } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    // Initial render always uses expanded width to match SSR (avoid flickering)
    const collapsed = isClient ? isCollapsed : false;

    return (
        <>
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-10 hidden flex-col border-r border-white/10 bg-zinc-900/50 backdrop-blur-xl sm:flex transition-all duration-300 ease-in-out",
                    collapsed ? "w-14" : "w-64"
                )}
            >
                <div className={cn(
                    "flex h-16 items-center border-b border-white/5 transition-all duration-300",
                    collapsed ? "px-2 justify-center" : "px-6 justify-between"
                )}>
                    {/* Header Slot (Logo/Title) */}
                    <div className={cn(
                        "transition-all duration-300 overflow-hidden",
                        collapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                    )}>
                        {header}
                    </div>

                    {/* Toggle Button */}
                    <SidebarToggle />
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-custom">
                    <nav className="flex flex-col gap-2 px-3 py-6">
                        {children}
                    </nav>
                </div>

                <div className="border-t border-white/5 pt-4">
                    <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                        {footer}
                    </nav>
                </div>
            </aside>

            {/* Dynamic Padding Wrapper for Main Content */}
            <div
                className={cn(
                    "flex flex-col sm:gap-4 transition-all duration-300 ease-in-out",
                    collapsed ? "sm:pl-14" : "sm:pl-64"
                )}
            >
                {/* DashboardHeader is usually absolute or fixed, check its implementation */}
                {/* If it's relative inside this div, it might need to know the width too */}
            </div>
        </>
    );
}


