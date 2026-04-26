"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Service } from "./types";

interface DeliverablesProps {
    service: Service;
    isId: boolean;
}

export function Deliverables({ service, isId }: DeliverablesProps) {
    const tService = useTranslations("Service");

    const deliverablesList = (isId && Array.isArray(service.features_id)) 
        ? service.features_id as string[]
        : (Array.isArray(service.features) ? service.features as string[] : []);

    if (!deliverablesList || deliverablesList.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-1">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1 h-3 bg-brand-yellow rounded-full" />
                    {tService("deliverables")}
                </h4>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {isId ? "Apa yang Anda Dapatkan" : "What You'll Get"}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliverablesList.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-brand-yellow/20 transition-all duration-300 group/item">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 group-hover/item:bg-brand-yellow/20 transition-colors shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-brand-yellow" />
                        </div>
                        <span className="text-xs md:text-sm text-white font-medium leading-tight transition-colors">
                            {item}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
