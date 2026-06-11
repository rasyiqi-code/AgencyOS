"use client";

import { UserButton } from "@hexclave/next";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft,
    LayoutDashboard,
    Layers,
    Package,
    Users,
    Mail,
    ShoppingCart,
    MessageSquare,
    Repeat,
    Megaphone,
    Sparkles,
    Images,
    UserPlus,
    ShieldCheck,
    Settings
} from "lucide-react";
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
    const tSidebar = useTranslations("Dashboard.Sidebar");
    const { title, actions } = useAdminHeaderStore();

    // Perbaikan untuk profil image kosong pada integrasi auth
    const { mockUserFallback } = useSafeUser();

    // Normalisasi path untuk mengabaikan locale (misal /id/admin... -> /admin...)
    const cleanPath = pathname.replace(/^\/(en|id)/, "") || "/";

    // Periksa apakah kita tidak berada di halaman utama dashboard atau halaman utama admin
    const showBackButton = cleanPath !== "/dashboard" && cleanPath !== "/admin";
    const isProjectPage = cleanPath === "/admin/pm/projects";

    const getAdminHeaderData = () => {
        if (!cleanPath.startsWith("/admin")) return null;

        const path = cleanPath.replace(/\/$/, "");

        switch (path) {
            case "/admin":
                return {
                    title: tSidebar("overview") || "Overview",
                    icon: <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/pm/projects":
                return {
                    title: tSidebar("missionBoard") || "Mission Board",
                    icon: <Layers className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/pm/services":
                return {
                    title: tSidebar("serviceCatalog") || "Service Catalog",
                    icon: <Package className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/clients":
                return {
                    title: tSidebar("clients") || "Clients",
                    icon: <Users className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/support":
                return {
                    title: tSidebar("supportInbox") || "Support Inbox",
                    icon: <Mail className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/finance/orders":
                return {
                    title: "Direct Orders",
                    icon: <ShoppingCart className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/finance/quotes":
                return {
                    title: "Quotes & Invoices",
                    icon: <MessageSquare className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/finance/subscriptions":
                return {
                    title: "Subscriptions",
                    icon: <Repeat className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/marketing/promotions":
                return {
                    title: "Visual Promos",
                    icon: <Megaphone className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/marketing/popups":
                return {
                    title: "Promotional Popups",
                    icon: <Sparkles className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/portfolio":
                return {
                    title: "Portfolio Admin",
                    icon: <Images className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/testimonials":
                return {
                    title: "Testimonials",
                    icon: <MessageSquare className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/marketing/leads":
                return {
                    title: "Contact Leads",
                    icon: <UserPlus className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/marketing/subscribers":
                return {
                    title: "Newsletter Subs",
                    icon: <Mail className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/media":
                return {
                    title: "Media Library",
                    icon: <Images className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/team":
                return {
                    title: "Team Roles",
                    icon: <ShieldCheck className="w-4 h-4 text-zinc-500" />
                };
            case "/admin/system/settings":
                return {
                    title: tSidebar("system") || "System Settings",
                    icon: <Settings className="w-4 h-4 text-zinc-500" />
                };
            default:
                if (path.startsWith("/admin/support/")) {
                    return {
                        title: "Ticket Details",
                        icon: <Mail className="w-4 h-4 text-zinc-500" />
                    };
                }
                if (path.startsWith("/admin/system/")) {
                    return {
                        title: tSidebar("system") || "System Settings",
                        icon: <Settings className="w-4 h-4 text-zinc-500" />
                    };
                }
                return null;
        }
    };

    const headerData = getAdminHeaderData();
    const displayTitle = title || (headerData ? (
        <span className="flex items-center gap-2">
            {headerData.title}
            {headerData.icon}
        </span>
    ) : null);

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
                {displayTitle && (
                    <div className="ml-2 font-bold text-white text-base sm:text-lg md:text-xl tracking-tight flex items-center gap-2 border-l border-white/10 pl-3 sm:pl-4 truncate animate-in fade-in slide-in-from-left-2 duration-300">
                        {displayTitle}
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
