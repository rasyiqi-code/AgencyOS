"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DashboardCurrencySwitcher, DashboardLanguageSwitcher } from "@/components/dashboard/header/currency-switcher";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface NavItem {
    href: string;
    label: string;
}

interface MobileNavProps {
    agencyName: string;
    logoUrl?: string;
    navItems: NavItem[];
    loginUrl: string;
    loginLabel: string;
    startProjectUrl: string;
    startProjectLabel: string;
}

export function MobileNav({
    agencyName,
    logoUrl,
    navItems,
    loginUrl,
    loginLabel,
    startProjectUrl,
    startProjectLabel
}: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 shrink-0">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-zinc-950 border-zinc-800 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-white/10 text-left">
                    <SheetTitle className="text-white flex items-center gap-2">
                        {logoUrl ? (
                            <div className="relative h-8 w-auto aspect-[3/1] max-w-[120px]">
                                <Image
                                    src={logoUrl}
                                    alt={agencyName}
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        ) : (
                            <span className="font-bold">{agencyName}</span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="flex flex-col space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors ${pathname === item.href
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="my-8 border-t border-white/10 pt-8 space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <span className="text-sm text-zinc-500 font-mono uppercase tracking-wider">Region</span>
                            <div className="flex items-center gap-2 ml-auto">
                                <DashboardLanguageSwitcher />
                                <DashboardCurrencySwitcher />
                            </div>
                        </div>

                        <div className="space-y-3 px-4">
                            <Link href={loginUrl} onClick={() => setOpen(false)} className="block">
                                <Button variant="outline" className="w-full justify-start text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white">
                                    {loginLabel}
                                </Button>
                            </Link>
                            <Link href={startProjectUrl} onClick={() => setOpen(false)} className="block">
                                <Button className="w-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold">
                                    {startProjectLabel}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
