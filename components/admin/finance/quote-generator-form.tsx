"use client";

import { useState } from "react";
import { UserSelector } from "./user-selector";
import { Button } from "@/components/ui/button";
import { createManualQuote } from "@/app/actions/quotes";
import type { Service } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

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

    const isOffline = selectedUserId === 'OFFLINE';

    return (
        <form
            action={async (formData) => {
                await createManualQuote(formData);
            }}
            className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 sm:items-end"
        >
            <div className="w-full space-y-1.5 group">
                <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1 transition-colors group-focus-within:text-brand-yellow">{translations.selectServiceLabel}</label>
                <select
                    name="serviceId"
                    defaultValue=""
                    className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 transition-all hover:bg-black/60"
                    required
                >
                    <option value="" disabled className="bg-zinc-900">{translations.selectService}</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id} className="bg-zinc-900">{s.title} ({s.currency})</option>
                    ))}
                </select>
            </div>

            <div className="w-full space-y-1.5 group">
                <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1 transition-colors group-focus-within:text-brand-yellow">{translations.selectClientLabel}</label>
                <UserSelector users={availableUsers} onValueChange={setSelectedUserId} />
            </div>

            <AnimatePresence mode="popLayout">
                {isOffline && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2"
                    >
                        <div className="w-full space-y-1.5 group">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1 transition-colors group-focus-within:text-brand-yellow">{translations.displayNameLabel}</label>
                            <input
                                name="clientName"
                                placeholder="E.g. John Doe"
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 transition-all hover:bg-black/60"
                            />
                        </div>
                        <div className="w-full space-y-1.5 group">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1 transition-colors group-focus-within:text-brand-yellow">{translations.emailLabel}</label>
                            <input
                                name="clientEmail"
                                type="email"
                                placeholder="E.g. client@email.com"
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 transition-all hover:bg-black/60"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full space-y-1.5 group">
                <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1 transition-colors group-focus-within:text-brand-yellow">{translations.priceLabel}</label>
                <div className="relative">
                    <input
                        name="amount"
                        type="number"
                        placeholder="E.g. 500"
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 transition-all hover:bg-black/60 font-mono"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-brand-yellow hover:bg-yellow-400 text-black font-bold h-[48px] rounded-xl text-sm sm:col-span-2 lg:col-span-1 shadow-lg shadow-brand-yellow/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                {translations.generateButton}
            </Button>
        </form>
    );
}
