"use client";

import { UserButton } from "@hexclave/next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProjectSearch } from "@/components/admin/pm/project-search";
import { ProjectFilter } from "@/components/admin/pm/project-filter";
import { useSafeUser } from "@/hooks/use-safe-user";
import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "./currency-switcher";
import { MobileNav } from "./mobile-nav";
import { MobileConfigMenu } from "./mobile-config-menu";
import { MobileProjectActions } from "@/components/admin/pm/mobile-project-actions";
import { useAdminHeaderStore } from "@/lib/store/admin-header-store";

interface DashboardHeaderProps {
    allowedToSwitchViews?: boolean;
    agencyName?: string;
    logoUrl?: string;
    navChildren?: React.ReactNode;
    navFooter?: React.ReactNode;
}

export function DashboardHeader({
    agencyName = "Agency OS",
    logoUrl,
    navChildren,
    navFooter
}: DashboardHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("Common");
    const { title, actions } = useAdminHeaderStore();

    // Perbaikan untuk profil image kosong pada integrasi auth
    const { mockUserFallback } = useSafeUser();

    // Normalisasi path untuk mengabaikan locale (misal /id/admin... -> /admin...)
    const cleanPath = pathname.replace(/^\/(en|id)/, "") || "/";

    // Periksa apakah kita tidak berada di halaman utama dashboard atau halaman utama admin
    const showBackButton = cleanPath !== "/dashboard" && cleanPath !== "/admin";
    const isProjectPage = cleanPath === "/admin/pm/projects";

    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 border-b border-white/5 bg-black/50 backdrop-blur-sm px-3 sm:px-6">
            <div className="flex items-center gap-2 flex-1 min-w-0">
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

                {/* Dinamis Judul Halaman Admin */}
                {title && (
                    <div className="ml-2 font-bold text-white text-base sm:text-lg md:text-xl tracking-tight flex items-center gap-2 border-l border-white/10 pl-3 sm:pl-4 truncate animate-in fade-in slide-in-from-left-2 duration-300">
                        {title}
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
                {/* Dinamis Tombol Aksi Admin */}
                {actions && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300 mr-1 sm:mr-2">
                        {actions}
                    </div>
                )}

                <div className="hidden md:block">
                    <UserButton mockUser={mockUserFallback} />
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
