"use client";
import { useRouter } from "@/lib/router/hooks";


import { useCurrency } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useNavigate, useLocation, useSearch } from "@tanstack/react-router";

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
    const { pathname } = useLocation();
    const search = useSearch({ strict: false });
    const [mounted, setMounted] = useState(false);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    // Menggunakan window.location.pathname di client-side karena pathname router telah di-rewrite
    const pathnameToUse = typeof window !== 'undefined' ? window.location.pathname : pathname;
    const currentLocale = pathnameToUse?.split('/')[1]?.length === 2 ? pathnameToUse.split('/')[1] : 'en';

    const toggle = () => {
        if (isPending) return;
        setIsPending(true);

        const newLocale = currentLocale === 'en' ? 'id' : 'en';

        // Sesuaikan segmen path berdasarkan locale baru
        const currentPathname = typeof window !== 'undefined' ? window.location.pathname : pathname;
        const segments = currentPathname?.split('/') || [];
        if (segments[1]?.length === 2) {
            if (newLocale === 'en') {
                // Hapus segmen locale jika kembali ke default (English)
                segments.splice(1, 1);
            } else {
                segments[1] = newLocale;
            }
        } else {
            if (newLocale !== 'en') {
                // Sisipkan locale jika beralih ke non-default
                segments.splice(1, 0, newLocale);
            }
        }

        const newPath = segments.join('/') || '/';

        // Set cookie untuk persistensi locale
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

        // Lakukan navigasi fisik penuh agar browser memuat ulang halaman dengan locale baru
        // Ini memastikan state SSR dan client selalu sinkron dan mencegah masalah routing no-op pada TanStack Router
        if (typeof window !== 'undefined') {
            window.location.href = newPath;
        }
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
