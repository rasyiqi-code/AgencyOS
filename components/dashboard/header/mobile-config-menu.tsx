"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Globe, DollarSign, Settings2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";


export function MobileConfigMenu() {
    const { currency, setCurrency } = useCurrency();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    // Language Logic

    const currentLocale = pathname?.split('/')[1]?.length === 2 ? pathname.split('/')[1] : 'en';

    const changeLanguage = (newLocale: string) => {
        if (newLocale === currentLocale) return;

        const segments = pathname?.split('/') || [];
        if (segments[1]?.length === 2) {
            segments[1] = newLocale;
        } else {
            segments.splice(1, 0, newLocale);
        }

        const newPath = segments.join('/') || '/';
        const queryString = searchParams?.toString();
        const newPathWithParams = queryString ? `${newPath}?${queryString}` : newPath;

        startTransition(() => {
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
            router.push(newPathWithParams);
            router.refresh();
        });
    };



    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Settings2 className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-white/10 text-zinc-400">
                <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Appearance & Region
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />

                {/* Language Section */}
                <DropdownMenuLabel className="flex items-center gap-2 text-zinc-200">
                    <Globe className="w-4 h-4 text-brand-yellow" />
                    Language
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={currentLocale} onValueChange={changeLanguage}>
                    <DropdownMenuRadioItem value="en" className="text-sm cursor-pointer focus:bg-white/5">
                        English (EN)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="id" className="text-sm cursor-pointer focus:bg-white/5">
                        Indonesia (ID)
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator className="bg-white/5" />

                {/* Currency Section */}
                <DropdownMenuLabel className="flex items-center gap-2 text-zinc-200">
                    <DollarSign className="w-4 h-4 text-brand-yellow" />
                    Currency
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={currency} onValueChange={(val) => setCurrency(val as 'USD' | 'IDR')}>
                    <DropdownMenuRadioItem value="USD" className="text-sm cursor-pointer focus:bg-white/5">
                        United States Dollar (USD)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="IDR" className="text-sm cursor-pointer focus:bg-white/5">
                        Indonesian Rupiah (IDR)
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
