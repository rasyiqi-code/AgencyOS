import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "@/components/dashboard/header/currency-switcher";
import { stackServerApp } from "@/lib/stack";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/db";

export async function SiteHeader() {
    const user = await stackServerApp.getUser();
    const t = await getTranslations("Navigation");
    const tc = await getTranslations("Common");

    // Fetch Logo
    const logoSetting = await prisma.systemSetting.findUnique({
        where: { key: "LOGO_URL" }
    });
    const logoUrl = logoSetting?.value;

    return (
        <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0a0a]/80 transition-all duration-300">
            <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain hover:scale-105 transition-transform" />
                    ) : (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105">
                                <span className="font-bold text-white text-lg">C</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white hidden sm:block group-hover:text-blue-100 transition-colors">Crediblemark</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 mr-2 border-r border-white/5 pr-6 hidden md:flex">
                        <DashboardLanguageSwitcher />
                        <DashboardCurrencySwitcher />
                    </div>

                    <nav className="flex items-center gap-6 hidden md:flex">
                        <Link href="/squad" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200">
                            {t("forTalent")}
                        </Link>
                        <Link href="/price-calculator" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200">
                            {t("priceCalculator")}
                        </Link>
                        <Link href="/services" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200">
                            {t("services")}
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href="/dashboard">
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

                        <Link href="/price-calculator">
                            <Button className="h-9 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium cursor-pointer rounded-full px-5 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 border-0">
                                {t("startProject")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
