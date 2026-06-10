"use client";
import { useRouter } from "@/lib/router/hooks";


import React, { createContext, useContext, useEffect, useState } from 'react';

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
    const [rate, setRate] = useState(16000); // Default fallback
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {

            // Sync with localStorage on client mount
            if (typeof window !== 'undefined') {
                const cached = localStorage.getItem('agency-os-currency');
                if (cached === 'USD' || cached === 'IDR') {
                    setCurrency(cached as Currency);
                } else {
                    // Detect currency if not set
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
                }
            }
        }, 0);

        // Fetch Dynamic Rate
        fetch('/api/currency/rates', { cache: 'no-store' })
            .then(async res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const text = await res.text();
                return text ? JSON.parse(text) : {};
            })
            .then(data => {
                if (data && data.rates && data.rates.IDR) {
                    setRate(data.rates.IDR);
                }
            })
            .catch(err => {
                console.warn("[CurrencyProvider] Rate fetch failed (using fallback):", err.message);
                // Fallback is already set in state (16000)
            });

        return () => clearTimeout(timer);
    }, []);

    const updateCurrency = (c: Currency) => {
        setCurrency(c);
        localStorage.setItem('agency-os-currency', c);
    };

    const updateLocale = (l: string) => {
        setLocale(l);
        // Sync with Cookie for Server Components
        document.cookie = `APP_LOCALE=${l}; path=/; max-age=31536000`;
        // Sync with LocalStorage (optional, but good for backup)
        localStorage.setItem('agency-os-locale', l);
        // Invalidate router to re-render with new locale
        router.invalidate();
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency, locale, setLocale: updateLocale, rate }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function PriceDisplay({
    amount,
    baseCurrency = 'USD',
    compact = false,
    exchangeRate,
    forceCurrency
}: {
    amount: number,
    baseCurrency?: 'USD' | 'IDR',
    compact?: boolean,
    exchangeRate?: number,
    forceCurrency?: 'USD' | 'IDR'
}) {
    const { currency: contextCurrency, locale, rate: contextRate } = useCurrency();

    const currency = forceCurrency || contextCurrency;
    // Use the provided exchangeRate if available, otherwise use context rate.
    // NOTE: rate logic implies 1 USD = X IDR.
    const rate = exchangeRate || contextRate;

    let displayAmount = amount;

    // Convert if base currency and display currency are different
    if (baseCurrency === 'USD' && currency === 'IDR') {
        displayAmount = amount * rate;
    } else if (baseCurrency === 'IDR' && currency === 'USD') {
        // If we want to convert IDR back to USD using the rate
        displayAmount = amount / rate;
    }

    // Custom compact formatting for IDR (jt/rb/m)
    if (compact && currency === 'IDR') {
        if (displayAmount >= 1000000000) {
            const formatted = (displayAmount / 1000000000).toLocaleString(locale, {
                maximumFractionDigits: displayAmount % 1000000000 === 0 ? 0 : 1
            });
            return <span>Rp {formatted}m</span>;
        }
        if (displayAmount >= 1000000) {
            const formatted = (displayAmount / 1000000).toLocaleString(locale, {
                maximumFractionDigits: displayAmount % 1000000 === 0 ? 0 : 1
            });
            return <span>Rp {formatted}jt</span>;
        }
        if (displayAmount >= 1000) {
            const formatted = (displayAmount / 1000).toLocaleString(locale, {
                maximumFractionDigits: 0
            });
            return <span>Rp {formatted}rb</span>;
        }
    }

    // Standard formatting for all other cases (USD or non-ID locale IDR)
    // notation: 'compact' will use M, K for English locales
    return (
        <span>
            {new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                currencyDisplay: 'narrowSymbol',
                notation: compact ? 'compact' : 'standard',
                maximumFractionDigits: (compact && currency === 'USD') ? 1 : (currency === 'IDR' ? 0 : 2),
                minimumFractionDigits: (currency === 'IDR' || compact) ? 0 : 2,
            }).format(displayAmount)}
        </span>
    );
}
