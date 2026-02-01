"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

type Currency = 'USD' | 'IDR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    locale: string;
    setLocale: (l: string) => void;
    rate: number;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'USD',
    setCurrency: () => { },
    locale: 'en-US',
    setLocale: () => { },
    rate: 16000
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children, initialLocale = 'en-US' }: { children: React.ReactNode, initialLocale?: string }) {
    const [currency, setCurrency] = useState<Currency>('USD');
    const [locale, setLocale] = useState(initialLocale);
    const [mounted, setMounted] = useState(false);
    const [rate, setRate] = useState(16000); // Default fallback
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
        // Sync with localStorage on client mount
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('agency-os-currency');
            if (cached === 'USD' || cached === 'IDR') {
                setCurrency(cached as Currency);
            } else {
                // Detect currency if not set
                const detect = () => {
                    try {
                        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        if (['Asia/Jakarta', 'Asia/Pontianak', 'Asia/Makassar', 'Asia/Jayapura'].includes(timeZone)) {
                            setCurrency('IDR');
                            localStorage.setItem('agency-os-currency', 'IDR');
                        } else {
                            setCurrency('USD');
                            localStorage.setItem('agency-os-currency', 'USD');
                        }
                    } catch (error) {
                        console.error("Currency detection failed, defaulting to USD", error);
                    }
                };
                detect();
            }
        }

        // Fetch Dynamic Rate
        fetch('/api/currency/rates')
            .then(res => res.json())
            .then(data => {
                if (data.rates && data.rates.IDR) {
                    setRate(data.rates.IDR);
                }
            })
            .catch(err => console.error("Rate fetch failed", err));
    }, []);

    if (!mounted) {
        return null; // or return children with default USD to avoid flash, but returning null ensures clean hydration
    }

    const updateCurrency = (c: Currency) => {
        setCurrency(c);
        localStorage.setItem('agency-os-currency', c);
    };

    const updateLocale = (l: string) => {
        setLocale(l);
        // Sync with Cookie for Server Components
        setCookie('NEXT_LOCALE', l);
        // Sync with LocalStorage (optional, but good for backup)
        localStorage.setItem('agency-os-locale', l);
        // Refresh to re-render Server Components with new locale
        router.refresh();
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency, locale, setLocale: updateLocale, rate }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function PriceDisplay({ amount, baseCurrency = 'USD' }: { amount: number, baseCurrency?: 'USD' | 'IDR' }) {
    const { currency, locale, rate } = useCurrency();

    let displayAmount = amount;

    // Convert if base currency and display currency are different
    if (baseCurrency === 'USD' && currency === 'IDR') {
        displayAmount = amount * rate;
    } else if (baseCurrency === 'IDR' && currency === 'USD') {
        displayAmount = amount / rate;
    }

    return (
        <span>
            {new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: currency === 'IDR' ? 0 : 2,
                minimumFractionDigits: currency === 'IDR' ? 0 : 2,
            }).format(displayAmount)}
        </span>
    );
}
