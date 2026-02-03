"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

export function DashboardCurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const toggle = () => {
        if (isLoading) return;
        setIsLoading(true);
        // Simulate network/transition delay for UX
        setTimeout(() => {
            setCurrency(currency === 'USD' ? 'IDR' : 'USD');
            setIsLoading(false);
        }, 500);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            disabled={isLoading}
            className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-white/10"
        >
            {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-yellow" />
            ) : (
                <DollarSign className="w-3.5 h-3.5 text-brand-yellow" />
            )}
            <span className="font-mono text-xs font-semibold">
                {mounted ? currency : '---'}
            </span>
        </Button>
    );
}

export function DashboardLanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    // Simple detection based on first path segment being 2 chars
    const currentLocale = pathname?.split('/')[1]?.length === 2 ? pathname.split('/')[1] : 'en';

    const toggle = () => {
        const newLocale = currentLocale === 'en' ? 'id' : 'en';

        // Remove old locale if present
        const segments = pathname?.split('/') || [];
        if (segments[1]?.length === 2) {
            segments[1] = newLocale;
        } else {
            segments.splice(1, 0, newLocale);
        }

        const newPath = segments.join('/') || '/';

        // Optimistic UI & Transition
        startTransition(() => {
            // Set cookie for client-side persistence redundancy
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
            router.push(newPath);
            router.refresh();
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            disabled={isPending}
            className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-white/10"
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-yellow" />
            ) : (
                <Globe className="w-3.5 h-3.5 text-brand-yellow" />
            )}
            <span className="font-mono text-xs font-semibold">
                {!mounted ? '...' : (currentLocale === 'en' ? 'EN' : 'ID')}
            </span>
        </Button>
    );
}
