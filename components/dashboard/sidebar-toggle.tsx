"use client";

import { useSidebarStore } from "@/lib/store/sidebar-store";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function SidebarToggle() {
    const { isCollapsed, toggle } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    if (!isClient) return null;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className={cn(
                "h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/5 transition-all duration-300",
                isCollapsed ? "mx-auto" : "ml-auto"
            )}
        >
            {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
            ) : (
                <PanelLeftClose className="h-4 w-4" />
            )}
        </Button>
    );
}
