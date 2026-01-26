"use client";

import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { DashboardViewSwitcher } from "../admin/dashboard-view-switcher";
import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "./dashboard-currency-switcher";

export function DashboardHeader() {
    const pathname = usePathname();
    const router = useRouter();

    // Check if we are not on the root dashboard page
    const showBackButton = pathname !== "/dashboard";
    const isAdminPage = pathname.startsWith("/admin");

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-black/50 backdrop-blur-sm px-4 sm:h-16 sm:px-6">
            <div className="flex items-center gap-2">
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white hover:bg-white/10 gap-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                )}
                {isAdminPage && (
                    <div className="ml-2 border-l border-white/10 pl-4">
                        <DashboardViewSwitcher />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <DashboardLanguageSwitcher />
                <DashboardCurrencySwitcher />
                <UserButton />
            </div>
        </header>
    );
}
