"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
    listeners.add(onStoreChange);
    return () => listeners.delete(onStoreChange);
}

function getLocaleSnapshot() {
    if (typeof document === 'undefined') return 'en';
    const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
    return match ? match[2] : 'en';
}

function getServerSnapshot() {
    return 'en';
}

export function NavControls() {
    const { currency, setCurrency } = useCurrency();
    const router = useRouter();

    const lang = useSyncExternalStore(
        subscribe,
        getLocaleSnapshot,
        getServerSnapshot
    );

    const toggleCurrency = () => {
        const next = currency === 'USD' ? 'IDR' : 'USD';
        setCurrency(next);
    };

    const toggleLanguage = () => {
        const next = lang === 'en' ? 'id' : 'en';
        // Set cookie for next-intl middleware
        document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
        // Notify any listeners (including our own instances)
        listeners.forEach(listener => listener());
        router.refresh(); // Refresh to re-render server components with new locale
    };

    return (
        <div className="flex items-center gap-1 mr-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleCurrency}
                className="text-zinc-400 hover:text-white flex items-center gap-1.5 min-w-[60px]"
                title="Switch Currency"
            >
                {currency === 'USD' ? <DollarSign className="w-4 h-4" /> : <span className="text-xs font-bold">Rp</span>}
                <span className="text-xs font-medium">{currency}</span>
            </Button>

            <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-zinc-400 hover:text-white flex items-center gap-1.5 min-w-[60px]"
                title="Switch Language"
            >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">{lang}</span>
            </Button>
        </div>
    );
}
