"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { DashboardSidebarNavigation, DashboardSidebarFooter } from "../sidebar/navigation";
import Link from "next/link";

import { UserButton } from "@hexclave/next";
import { useSafeUser } from "@/hooks/use-safe-user";

interface MobileNavProps {
    agencyName: string;
    logoUrl?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

export function MobileNav({ agencyName, children, footer }: MobileNavProps) {
    const { mockUserFallback } = useSafeUser();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-zinc-400 hover:text-white hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-zinc-950 border-white/10 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between gap-2 space-y-0">
                    <SheetTitle>
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <span className="text-lg tracking-tight text-white truncate max-w-[140px]">
                                {agencyName}
                            </span>
                        </Link>
                    </SheetTitle>
                    <UserButton mockUser={mockUserFallback} />
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 px-3">
                    {children || <DashboardSidebarNavigation />}
                </div>

                <div className="p-4 border-t border-white/5">
                    {footer || <DashboardSidebarFooter />}
                </div>
            </SheetContent>
        </Sheet>
    );
}
