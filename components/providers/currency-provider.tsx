"use client";

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

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('USD');
    const [locale, setLocale] = useState('en-US');
    const [rate, setRate] = useState(16000); // Default fallback

    useEffect(() => {
        // 0. Fetch Dynamic Rate
        fetch('/api/currency/rates')
            .then(res => res.json())
            .then(data => {
                if (data.rates && data.rates.IDR) {
                    setRate(data.rates.IDR);
                }
            })
            .catch(err => console.error("Rate fetch failed", err));

        // 1. Check LocalStorage
        const cachedCurrency = localStorage.getItem('agency-os-currency');
        const cachedLocale = localStorage.getItem('agency-os-locale');

        if (cachedCurrency && (cachedCurrency === 'USD' || cachedCurrency === 'IDR')) {
            if (currency !== cachedCurrency) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCurrency(cachedCurrency as Currency);
            }
        }

        if (cachedLocale) {
            setLocale(cachedLocale);
        }

        // Only detect if nothing cached
        if (!cachedCurrency) {
            // 2. Timezone Heuristic
            const detect = () => {
                try {
                    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    console.log("Detected TimeZone:", timeZone);

                    // Check for Indonesia Timezones
                    if (['Asia/Jakarta', 'Asia/Pontianak', 'Asia/Makassar', 'Asia/Jayapura'].includes(timeZone)) {
                        setCurrency('IDR');
                        setLocale('id-ID');
                        localStorage.setItem('agency-os-currency', 'IDR');
                        localStorage.setItem('agency-os-locale', 'id-ID');
                    } else {
                        setCurrency('USD');
                        setLocale('en-US');
                        localStorage.setItem('agency-os-currency', 'USD');
                        localStorage.setItem('agency-os-locale', 'en-US');
                    }
                } catch (error) {
                    console.error("Currency detection failed, defaulting to USD", error);
                    setCurrency('USD');
                }
            };
            detect();
        }
    }, [currency]);

    const updateCurrency = (c: Currency) => {
        setCurrency(c);
        localStorage.setItem('agency-os-currency', c);
    };

    const updateLocale = (l: string) => {
        setLocale(l);
        localStorage.setItem('agency-os-locale', l);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency, locale, setLocale: updateLocale, rate }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function PriceDisplay({ amount, baseCurrency = 'USD' }: { amount: number, baseCurrency?: 'USD' }) {
    const { currency, locale, rate } = useCurrency();

    let displayAmount = amount;
    if (baseCurrency === 'USD' && currency === 'IDR') {
        displayAmount = amount * rate;
    }

    return (
        <span>
            {new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(displayAmount)}
        </span>
    );
}
