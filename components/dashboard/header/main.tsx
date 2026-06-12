"use client";

import { UserButton } from "@hexclave/next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Settings,
    Rocket,
    LifeBuoy,
    Receipt,
    Search,
    MessageSquarePlus
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

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
    const tClientQuotes = useTranslations("Dashboard.ClientQuotes");
    const { title, actions } = useAdminHeaderStore();

    // Perbaikan untuk profil image kosong pada integrasi auth
    const { mockUserFallback } = useSafeUser();

    // Normalisasi path untuk mengabaikan locale (misal /id/admin... -> /admin...)
    const cleanPath = pathname.replace(/^\/(en|id)/, "") || "/";
    const searchParams = useSearchParams();
    const qQuery = searchParams.get("q") || "";
    const isId = pathname.startsWith("/id");
    const isMissionsPage = cleanPath === "/dashboard/missions";
    const isSupportPage = cleanPath === "/dashboard/support";
 
    // Periksa apakah kita tidak berada di halaman utama dashboard atau halaman utama admin
    const showBackButton = cleanPath !== "/dashboard" && cleanPath !== "/admin";
    const isProjectPage = cleanPath === "/admin/pm/projects";

    const getHeaderData = () => {
        const path = cleanPath.replace(/\/$/, "");

        if (cleanPath.startsWith("/admin")) {
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
                        title: "Offline Trx",
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
        }

        if (cleanPath.startsWith("/dashboard")) {
            switch (path) {
                case "/dashboard":
                    return {
                        title: tSidebar("dashboard") || "Dashboard",
                        icon: <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                    };
                case "/dashboard/missions":
                    return {
                        title: tSidebar("missions") || "Missions",
                        icon: <Rocket className="w-4 h-4 text-zinc-500" />
                    };
                case "/dashboard/billing":
                    return {
                        title: tSidebar("billing") || "Billing",
                        icon: <Receipt className="w-4 h-4 text-zinc-500" />
                    };
                case "/dashboard/services":
                    return {
                        title: tSidebar("store") || "Services",
                        icon: <Sparkles className="w-4 h-4 text-zinc-500" />
                    };
                case "/dashboard/support":
                    return {
                        title: tSidebar("support") || "Support",
                        icon: <LifeBuoy className="w-4 h-4 text-zinc-500" />
                    };
                case "/dashboard/settings":
                    return {
                        title: tSidebar("settings") || "Settings",
                        icon: <Settings className="w-4 h-4 text-zinc-500" />
                    };
                case "/dashboard/quotes":
                    return {
                        title: tClientQuotes("title") || "My Quotes",
                        icon: <MessageSquare className="w-4 h-4 text-zinc-500" />
                    };
                default:
                    if (path.startsWith("/dashboard/support/new")) {
                        return {
                            title: "Create New Ticket",
                            icon: <LifeBuoy className="w-4 h-4 text-zinc-500" />
                        };
                    }
                    if (path.startsWith("/dashboard/support/")) {
                        return {
                            title: "Support Chat",
                            icon: <LifeBuoy className="w-4 h-4 text-zinc-500" />
                        };
                    }
                    if (path.startsWith("/dashboard/missions/")) {
                        return {
                            title: "Mission Details",
                            icon: <Rocket className="w-4 h-4 text-zinc-500" />
                        };
                    }
                    return null;
            }
        }

        return null;
    };

    const headerData = getHeaderData();
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

                {/* Input Pencarian Misi Klien di Header */}
                {isMissionsPage && (
                    <div className="ml-2 sm:ml-4 flex-1 max-w-[160px] sm:max-w-[200px] md:max-w-[280px] animate-in fade-in slide-in-from-top-2 duration-300">
                        <form className="relative w-full">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                            <Input
                                name="q"
                                placeholder={isId ? 'Cari misi...' : 'Search missions...'}
                                className="bg-zinc-900/50 border-white/10 pl-8 w-full h-8 text-xs focus-visible:ring-brand-yellow/30"
                                defaultValue={qQuery}
                            />
                        </form>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* Dinamis Tombol Aksi Admin */}
                {actions && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300 mr-1 sm:mr-2">
                        {actions}
                    </div>
                )}

                {/* Tombol Misi Baru untuk Klien di Header */}
                {isMissionsPage && (
                    <Link href="/price-calculator" className="mr-1 sm:mr-2">
                        <Button size="sm" className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-8 text-xs px-2.5 sm:px-3 flex items-center gap-1">
                            <span>{isId ? '+ Misi Baru' : '+ New Mission'}</span>
                        </Button>
                    </Link>
                )}

                {/* Tombol Buat Tiket Baru untuk Klien di Header */}
                {isSupportPage && (
                    <Link href="/dashboard/support/new" className="mr-1 sm:mr-2">
                        <Button size="sm" className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-8 text-xs px-2.5 sm:px-3 flex items-center gap-1.5">
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            <span>{isId ? 'Buat Tiket' : 'Create Ticket'}</span>
                        </Button>
                    </Link>
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
