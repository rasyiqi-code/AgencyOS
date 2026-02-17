"use client";

import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { DashboardViewSwitcher } from "@/components/admin/dashboard-view-switcher";
import { ProjectSearch } from "@/components/admin/pm/project-search";
import { ProjectFilter } from "@/components/admin/pm/project-filter";
import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "./currency-switcher";
import { MobileNav } from "./mobile-nav";
import { MobileConfigMenu } from "./mobile-config-menu";
import { MobileProjectActions } from "@/components/admin/pm/mobile-project-actions";

interface DashboardHeaderProps {
    allowedToSwitchViews?: boolean;
    agencyName?: string;
    logoUrl?: string;
    navChildren?: React.ReactNode;
    navFooter?: React.ReactNode;
}

export function DashboardHeader({
    allowedToSwitchViews = false,
    agencyName = "Agency OS",
    logoUrl,
    navChildren,
    navFooter
}: DashboardHeaderProps) {
    // ... path logic ...
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("Common");

    // Fix for Stack Auth bug: empty string profile image causes browser error


    // Normalize path to ignore locale (e.g. /id/admin... -> /admin...)
    const cleanPath = pathname.replace(/^\/(en|id)/, "") || "/";

    // Check if we are not on the root dashboard page or root admin page
    const showBackButton = cleanPath !== "/dashboard" && cleanPath !== "/admin";
    const isAdminPage = cleanPath.startsWith("/admin");
    const isProjectPage = cleanPath === "/admin/pm/projects";

    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 border-b border-white/5 bg-black/50 backdrop-blur-sm px-3 sm:px-6">
            <div className="flex items-center gap-2 flex-1">
                <MobileNav agencyName={agencyName} logoUrl={logoUrl} footer={navFooter}>
                    {navChildren}
                </MobileNav>

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
                {isAdminPage && allowedToSwitchViews && (
                    <div className="ml-2 border-l border-white/10 pl-2 sm:pl-4 shrink-0">
                        <DashboardViewSwitcher />
                    </div>
                )}

                {isProjectPage && (
                    <>
                        <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 ml-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <ProjectSearch />
                            <ProjectFilter />
                        </div>
                        <div className="md:hidden ml-auto mr-1">
                            <MobileProjectActions />
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:block">
                    <UserButton />
                </div>

                {/* Desktop Switchers */}
                <div className="hidden md:flex items-center gap-2">
                    <DashboardLanguageSwitcher />
                    <DashboardCurrencySwitcher />
                </div>

                {/* Mobile Config Menu */}
                <div className="flex md:hidden">
                    <MobileConfigMenu />
                </div>
            </div>
        </header>
    );
}
