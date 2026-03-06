"use client";

import { useState } from "react";
import { UserSelector } from "./user-selector";
import { Button } from "@/components/ui/button";
import { createManualQuote } from "@/app/actions/quotes";
import type { Service } from "@prisma/client";

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
            className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 sm:items-end"
        >
            <div className="w-full space-y-1.5">
                <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">{translations.selectServiceLabel}</label>
                <select
                    name="serviceId"
                    defaultValue=""
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                    required
                >
                    <option value="" disabled>{translations.selectService}</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id}>{s.title} ({s.currency})</option>
                    ))}
                </select>
            </div>

            <div className="w-full space-y-1.5">
                <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">{translations.selectClientLabel}</label>
                <UserSelector users={availableUsers} onValueChange={setSelectedUserId} />
            </div>

            {isOffline && (
                <>
                    <div className="w-full space-y-1.5">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">{translations.displayNameLabel}</label>
                        <input
                            name="clientName"
                            placeholder="E.g. John Doe"
                            className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                        />
                    </div>
                    <div className="w-full space-y-1.5">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">{translations.emailLabel}</label>
                        <input
                            name="clientEmail"
                            type="email"
                            placeholder="E.g. client@email.com"
                            className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                        />
                    </div>
                </>
            )}

            <div className="w-full space-y-1.5">
                <label className="text-[10px] uppercase text-zinc-500 font-bold ml-1">{translations.priceLabel}</label>
                <input
                    name="amount"
                    type="number"
                    placeholder="E.g. 500"
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-yellow font-mono"
                    required
                />
            </div>

            <Button type="submit" className="w-full bg-brand-yellow hover:bg-yellow-400 text-black font-bold h-[42px] text-sm sm:col-span-2 lg:col-span-1">
                {translations.generateButton}
            </Button>
        </form>
    );
}
