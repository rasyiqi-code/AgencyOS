import Link from "next/link";
import { Button } from "@/components/ui/button";

import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "@/components/dashboard/dashboard-currency-switcher";

import { stackServerApp } from "@/lib/stack";

export async function SiteHeader() {
    const user = await stackServerApp.getUser();

    return (
        <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="font-bold text-white text-lg">C</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Crediblemark</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 mr-2">
                        <DashboardLanguageSwitcher />
                        <DashboardCurrencySwitcher />
                    </div>
                    <Link href="/squad">
                        <Button variant="ghost" className="text-zinc-400 hover:text-green-400 hover:bg-green-500/10 hidden md:inline-flex">
                            For Talent
                        </Button>
                    </Link>
                    <Link href="/price-calculator">
                        <Button variant="ghost" className="text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10">
                            Price Calculator
                        </Button>
                    </Link>



                    {user ? (
                        <Link href="/dashboard">
                            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                                My Account
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/handler/sign-in">
                            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                                Login
                            </Button>
                        </Link>
                    )}

                    <Link href="/price-calculator">
                        <Button className="bg-white text-black hover:bg-zinc-200 font-medium cursor-pointer">
                            Start Project
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
