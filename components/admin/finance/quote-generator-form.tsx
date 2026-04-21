"use client";

import { useState } from "react";
import { UserSelector } from "./user-selector";
import { ServiceSelector } from "./service-selector";
import { Button } from "@/components/ui/button";
import { createManualQuote } from "@/app/actions/quotes";
import type { Service } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/components/providers/currency-provider";

interface UserAccount {
    id: string;
    name: string;
    email?: string;
}

interface QuoteGeneratorFormProps {
    services: Service[];
    availableUsers: UserAccount[];
    translations: {
        selectServiceLabel: string;
        selectService: string;
        selectClientLabel: string;
        displayNameLabel: string;
        emailLabel: string;
        priceLabel: string;
        generateButton: string;
    };
}

export function QuoteGeneratorForm({ services, availableUsers, translations }: QuoteGeneratorFormProps) {
    const [selectedUserId, setSelectedUserId] = useState("");
    const { currency: contextCurrency, rate } = useCurrency();

    const isOffline = selectedUserId === 'OFFLINE';

    return (
        <form
            action={async (formData) => {
                await createManualQuote(formData);
            }}
            className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 sm:items-end w-full"
        >
            <input type="hidden" name="contextCurrency" value={contextCurrency} />
            <input type="hidden" name="activeRate" value={rate} />
            <div className="w-full relative group sm:col-span-1 lg:col-span-3 bg-black/40 border border-zinc-800 rounded-xl focus-within:border-brand-yellow/50 focus-within:ring-1 focus-within:ring-brand-yellow/20 hover:bg-black/60 transition-all overflow-hidden">
                <label className="absolute top-2 left-4 text-[9px] uppercase text-zinc-500 font-bold transition-colors group-focus-within:text-brand-yellow z-10 pointer-events-none">
                    {translations.selectServiceLabel}
                </label>
                <div className="pt-5 pb-1 w-full">
                    <ServiceSelector
                        services={services}
                        translations={{ selectService: translations.selectService }}
                    />
                </div>
            </div>

            <div className="w-full relative group sm:col-span-1 lg:col-span-4 bg-black/40 border border-zinc-800 rounded-xl focus-within:border-brand-yellow/50 focus-within:ring-1 focus-within:ring-brand-yellow/20 hover:bg-black/60 transition-all">
                <label className="absolute top-2 left-4 text-[9px] uppercase text-zinc-500 font-bold transition-colors group-focus-within:text-brand-yellow z-10 pointer-events-none">
                    {translations.selectClientLabel}
                </label>
                <div className="pt-5 pb-1 w-full">
                    <UserSelector users={availableUsers} onValueChange={setSelectedUserId} />
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {isOffline && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 pb-2"
                    >
                        <div className="w-full relative group sm:col-span-1 lg:col-span-5 bg-black/40 border border-zinc-800 rounded-xl focus-within:border-brand-yellow/50 focus-within:ring-1 focus-within:ring-brand-yellow/20 hover:bg-black/60 transition-all overflow-hidden">
                            <label className="absolute top-2 left-4 text-[9px] uppercase text-zinc-500 font-bold transition-colors group-focus-within:text-brand-yellow z-10 pointer-events-none">
                                {translations.displayNameLabel}
                            </label>
                            <input
                                name="clientName"
                                placeholder="E.g. John Doe"
                                className="w-full h-full bg-transparent pt-6 pb-2 px-4 text-sm text-white focus:outline-none"
                                required
                            />
                        </div>
                        <div className="w-full relative group sm:col-span-1 lg:col-span-7 bg-black/40 border border-zinc-800 rounded-xl focus-within:border-brand-yellow/50 focus-within:ring-1 focus-within:ring-brand-yellow/20 hover:bg-black/60 transition-all overflow-hidden">
                            <label className="absolute top-2 left-4 text-[9px] uppercase text-zinc-500 font-bold transition-colors group-focus-within:text-brand-yellow z-10 pointer-events-none">
                                {translations.emailLabel}
                            </label>
                            <input
                                name="clientEmail"
                                type="text"
                                placeholder="E.g. client@email.com or +628123..."
                                className="w-full h-full bg-transparent pt-6 pb-2 px-4 text-sm text-white focus:outline-none"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full relative group sm:col-span-1 lg:col-span-3 bg-black/40 border border-zinc-800 rounded-xl focus-within:border-brand-yellow/50 focus-within:ring-1 focus-within:ring-brand-yellow/20 hover:bg-black/60 transition-all overflow-hidden">
                <label className="absolute top-2 left-4 text-[9px] uppercase text-zinc-500 font-bold transition-colors group-focus-within:text-brand-yellow z-10 pointer-events-none">
                    {translations.priceLabel}
                </label>
                <div className="relative h-full flex items-end">
                    <div className="absolute bottom-2.5 left-4 flex items-center pointer-events-none z-10">
                        <span className="text-zinc-500 text-sm font-mono">{contextCurrency === 'IDR' ? 'Rp' : '$'}</span>
                    </div>
                    <input
                        name="amount"
                        type="number"
                        placeholder="E.g. 500"
                        className={`w-full bg-transparent pt-6 pb-2 pr-4 text-sm text-white focus:outline-none font-mono [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield] ${contextCurrency === 'IDR' ? 'pl-[44px]' : 'pl-[30px]'}`}
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-brand-yellow hover:bg-yellow-400 text-black font-bold h-[48px] rounded-xl text-sm sm:col-span-1 lg:col-span-2 shadow-lg shadow-brand-yellow/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                {translations.generateButton}
            </Button>
        </form>
    );
}
