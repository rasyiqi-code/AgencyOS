"use client";
import { useRouter, usePathname } from "@/lib/router/hooks";


import { UserButton } from "@hexclave/tanstack-start";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useTranslations } from "@/lib/i18n/hooks";

import { ProjectSearch } from "@/components/admin/pm/project-search";
import { ProjectFilter } from "@/components/admin/pm/project-filter";
import { useSafeUser } from "@/hooks/use-safe-user";
import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "./currency-switcher";
import { useCurrency } from "@/components/providers/currency-provider";
import { MobileNav } from "./mobile-nav";
import { MobileConfigMenu } from "./mobile-config-menu";
import { MobileProjectActions } from "@/components/admin/pm/mobile-project-actions";
import { DashboardModeSwitcher } from "@/components/admin/dashboard-mode-switcher";
import { useHeaderStore } from "@/lib/store/header-store";

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
    // ... logic path ...
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("Common");
    const { locale } = useCurrency();
    const isId = locale === 'id-ID' || locale === 'id';
    const { actions } = useHeaderStore();

    // Perbaikan untuk bug Stack Auth: profil image kosong menyebabkan error browser
    const { mockUserFallback } = useSafeUser();

    // Normalisasi path untuk mengabaikan locale (misal /id/admin... -> /admin...)
    const cleanPath = pathname.replace(/^\/(en|id)/, "") || "/";

    // Periksa apakah kita tidak berada di halaman utama dashboard atau halaman utama admin
    const showBackButton = cleanPath !== "/dashboard" && cleanPath !== "/admin";
    const isAdminPage = cleanPath.startsWith("/admin");
    const isProjectPage = cleanPath === "/admin/pm/projects";

    // Dapatkan judul halaman dinamis untuk sub-dasbor klien
    const getPageTitle = (path: string, idLang: boolean) => {
        if (path.startsWith("/dashboard/billing")) return idLang ? "Tagihan & Faktur" : "Billing & Invoices";
        if (path.startsWith("/dashboard/settings")) return idLang ? "Pengaturan" : "Settings";
        if (path.startsWith("/dashboard/support")) return idLang ? "Bantuan" : "Support";
        if (path.startsWith("/dashboard/quotes")) return idLang ? "Penawaran Harga" : "Quotes";
        if (path.startsWith("/dashboard/missions/")) return idLang ? "Detail Misi" : "Mission Details";
        if (path === "/dashboard/missions") return idLang ? "Log Misi" : "Mission Log";
        if (path.startsWith("/dashboard/services")) return idLang ? "Layanan Kami" : "Our Services";
        if (path.startsWith("/dashboard/my-products")) return idLang ? "Produk Saya" : "My Products";
        if (path.startsWith("/dashboard/inbox")) return idLang ? "Kotak Masuk" : "Inbox";
        if (path.startsWith("/affiliate/dashboard")) return idLang ? "Dasbor Mitra" : "Partner Dashboard";
        if (path.startsWith("/affiliate/payouts")) return idLang ? "Penarikan & Pendapatan" : "Payouts & Earnings";
        if (path.startsWith("/affiliate/resources")) return idLang ? "Marketing Kit" : "Marketing Kit";
        return "";
    };
    const pageTitle = getPageTitle(cleanPath, isId);

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

                {/* Judul Halaman Dinamis */}
                {pageTitle && (
                    <span className="text-sm font-bold text-white pl-2 border-l border-white/10 ml-1 sm:ml-2">
                        {pageTitle}
                    </span>
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
                {/* Dynamic Actions */}
                {actions && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {actions}
                    </div>
                )}

                {/* Switcher Mode Dasbor untuk Admin (Hanya muncul di halaman utama overview admin) */}
                {(cleanPath === "/admin" || cleanPath === "/admin/") && (
                    <div className="mr-1 sm:mr-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <DashboardModeSwitcher />
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
