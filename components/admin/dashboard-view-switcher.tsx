
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Layers } from "lucide-react";
import { useSyncExternalStore } from 'react';

interface Props {
    currentView?: string;
}

export function DashboardViewSwitcher({ currentView: propView }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );


    // Determine view based on path if prop not provided
    let currentView = propView || "all";
    if (!propView) {
        if (pathname.includes("/admin/finance")) {
            currentView = "finance";
        } else if (pathname.includes("/admin/pm")) {
            currentView = "project";
        }
    }

    const handleViewChange = (value: string) => {
        if (value === "all") {
            router.push("/admin");
        } else if (value === "finance") {
            router.push("/admin/finance");
        } else if (value === "project") {
            router.push("/admin/pm");
        }
    };

    if (!mounted) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider hidden sm:inline-block">View As:</span>
                <div className="w-[180px] h-8 bg-zinc-900 border border-zinc-800 rounded-md animate-pulse" />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider hidden sm:inline-block">View As:</span>
            <Select value={currentView} onValueChange={handleViewChange}>
                <SelectTrigger className="w-[180px] h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectValue placeholder="Select View" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-3 h-3 text-zinc-400" />
                            <span>Command Center</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="finance">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-3 h-3 text-emerald-500" />
                            <span>Finance Admin</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="project">
                        <div className="flex items-center gap-2">
                            <Layers className="w-3 h-3 text-blue-500" />
                            <span>Project Manager</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
