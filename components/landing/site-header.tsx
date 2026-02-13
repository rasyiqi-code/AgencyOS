import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "@/components/dashboard/header/currency-switcher";
import { stackServerApp } from "@/lib/config/stack";
import { Check } from "lucide-react";

import { getTranslations, getLocale } from "next-intl/server";

import { prisma } from "@/lib/config/db";

export async function SiteHeader() {
    const user = await stackServerApp.getUser();
    const t = await getTranslations("Navigation");
    const tc = await getTranslations("Common");
    const locale = await getLocale();

    // Fetch Logo
    // Fetch Logo & Brand
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_LOGO", "AGENCY_NAME", "AGENCY_LOGO_DISPLAY"] } }
    });
    const logoUrl = settings.find(s => s.key === "AGENCY_LOGO")?.value;
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";
    const displayMode = settings.find(s => s.key === "AGENCY_LOGO_DISPLAY")?.value || "both"; // 'both', 'logo', 'text'


    // Actually, "Text Only" usually implies just the text name.
    // "Logo Only" implies just the image.
    // "Both" implies Image + Text.
    // If no Image exists, we show Fallback Icon + Text usually.
    // Let's refine:

    // RENDER LOGIC:
    // Image/Icon component:
    // IF (ShowLogo AND logoUrl) -> Render Image
    // ELSE IF (mode != 'text') -> Render Icon (Fallback)

    // Text component:
    // IF (ShowText) -> Render Text

    return (
        <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0a0a]/80 transition-all duration-300">
            <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href={`/${locale}`} className="flex items-center gap-2 group cursor-pointer">
                        {/* Logo / Icon Section */}
                        {displayMode !== 'text' && (
                            logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt="Logo"
                                    width={120}
                                    height={32}
                                    className="h-8 w-auto object-contain hover:scale-105 transition-transform"
                                    priority
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-grey flex items-center justify-center shadow-lg shadow-zinc-500/20 group-hover:shadow-zinc-500/30 transition-all duration-300 hover:scale-105">
                                    <Check className="h-5 w-5 text-brand-yellow stroke-[3]" />
                                </div>
                            )
                        )}

                        {/* Text Section */}
                        {(displayMode === 'text' || displayMode === 'both') && (
                            <span className="font-bold text-lg tracking-tight text-white hidden sm:block group-hover:text-zinc-200 transition-colors">
                                {agencyName}
                            </span>
                        )}
                    </Link>

                    <nav className="flex items-center gap-6 hidden md:flex">

                        <Link href={`/${locale}/price-calculator`} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer">
                            {t("priceCalculator")}
                        </Link>
                        <Link href={`/${locale}/services`} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer">
                            {t("services")}
                        </Link>
                        <Link href={`/${locale}/products`} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer">
                            {t("products")}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-0.5 mr-2 border-r border-white/5 pr-4 hidden md:flex">
                        <DashboardLanguageSwitcher />
                        <DashboardCurrencySwitcher />
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href={`/${locale}/dashboard`}>
                                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full px-3 h-8 text-xs">
                                    {t("myAccount")}
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/handler/sign-in">
                                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full px-3 h-8 text-xs">
                                    {tc("login")}
                                </Button>
                            </Link>
                        )}

                        <Link href={`/${locale}/price-calculator`}>
                            <Button className="h-9 text-sm bg-brand-yellow hover:bg-brand-yellow/90 text-black font-semibold cursor-pointer rounded-full px-5 shadow-lg shadow-brand-yellow/20 transition-all hover:scale-105 active:scale-95 border-0">
                                {t("startProject")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
