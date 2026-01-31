"use client";

import { UserButton, useUser } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { DashboardViewSwitcher } from "@/components/admin/dashboard-view-switcher";
import { ProjectSearch } from "@/components/admin/pm/project-search";
import { ProjectFilter } from "@/components/admin/pm/project-filter";
import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "./currency-switcher";

export function DashboardHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const user = useUser();
    const t = useTranslations("Common");

    // Fix for Stack Auth bug: empty string profile image causes browser error
    if (user && user.profileImageUrl === "") {
        try {
            // @ts-expect-error - patching readonly property to fix library bug
            // eslint-disable-next-line react-hooks/immutability
            user.profileImageUrl = null;
        } catch {
            // Ignore if object is frozen
        }
    }

    // Check if we are not on the root dashboard page
    const showBackButton = pathname !== "/dashboard";
    const isAdminPage = pathname.startsWith("/admin");
    const isProjectPage = pathname === "/admin/pm/projects";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-black/50 backdrop-blur-sm px-4 sm:h-16 sm:px-6">
            <div className="flex items-center gap-2 flex-1">
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white hover:bg-white/10 gap-2 shrink-0"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("back")}</span>
                    </Button>
                )}
                {isAdminPage && (
                    <div className="ml-2 border-l border-white/10 pl-4 shrink-0">
                        <DashboardViewSwitcher />
                    </div>
                )}

                {isProjectPage && (
                    <div className="flex-1 max-w-xl flex items-center gap-2 ml-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <ProjectSearch />
                        <ProjectFilter />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <UserButton />
                <DashboardLanguageSwitcher />
                <DashboardCurrencySwitcher />
            </div>
        </header>
    );
}
