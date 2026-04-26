"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface Feature
{
    title: string;
    description: string;
}


export function ServiceFeatures()
{
    const t = useTranslations("Cards");
    const tService = useTranslations("Service");

    const finalFeatures: Feature[] = [1, 2, 3, 4, 5, 6].map(i => ({
        title: tService(`f${i}`),
        description: tService("premiumStandard")
    }));

    return (
        <div className="space-y-10">
            <div className="flex flex-col items-center text-center space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 justify-center">
                    <div className="w-1 h-3 bg-brand-yellow rounded-full" />
                    {t("included")}
                </h4>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {tService("everythingToSucceed")}
                </h2>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 scrollbar-hide -mx-4 px-4 md:grid md:grid-cols-2 md:gap-4 md:mx-0 md:px-0">
                {finalFeatures.map((feature, i) => (
                    <div key={i} className="flex-shrink-0 w-[85vw] md:w-full snap-center flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-brand-yellow/20 transition-all duration-300 group/feat">
                        <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 group-hover/feat:bg-brand-yellow/20 transition-colors shrink-0">
                            <Check className="w-3 h-3 text-brand-yellow" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm md:text-base text-zinc-200 font-bold leading-tight group-hover/feat:text-white transition-colors block">
                                {feature.title}
                            </span>
                            <p className="text-xs text-zinc-500 leading-normal">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
