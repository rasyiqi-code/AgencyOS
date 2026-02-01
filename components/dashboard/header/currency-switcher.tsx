"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardCurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const toggle = () => {
        setCurrency(currency === 'USD' ? 'IDR' : 'USD');
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="flex items-center gap-2 text-zinc-400 hover:text-white border border-white/5 hover:bg-white/10"
        >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-mono text-xs font-semibold">
                {mounted ? currency : '---'}
            </span>
        </Button>
    );
}

export function DashboardLanguageSwitcher() {
    const { locale, setLocale } = useCurrency();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const toggle = () => {
        setLocale(locale === 'en-US' ? 'id-ID' : 'en-US');
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="flex items-center gap-2 text-zinc-400 hover:text-white border border-white/5 hover:bg-white/10"
        >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-mono text-xs font-semibold">
                {!mounted ? '...' : (locale === 'en-US' ? 'EN' : 'ID')}
            </span>
        </Button>
    );
}
