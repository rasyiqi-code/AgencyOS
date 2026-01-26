"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function NavControls() {
    const { currency, setCurrency } = useCurrency();
    const router = useRouter();
    const [lang, setLang] = useState('en');

    useEffect(() => {
        // Sync state with cookie on load
        const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (match && match[2] !== lang) setLang(match[2]);
    }, [lang]);

    const toggleCurrency = () => {
        const next = currency === 'USD' ? 'IDR' : 'USD';
        setCurrency(next);
        // We don't need to refresh for currency as it is client-side context
    };

    const toggleLanguage = () => {
        const next = lang === 'en' ? 'id' : 'en';
        // Set cookie for next-intl middleware
        document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
        setLang(next);
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
