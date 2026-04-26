"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

import { useTranslations } from "next-intl";

interface FooterInfoProps {
    trustedAvatars: string[];
}

export function FooterInfo({ trustedAvatars }: FooterInfoProps) {
    const t = useTranslations("Service");

    return (
        <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex -space-x-2">
                    {trustedAvatars.length > 0 ? (
                        trustedAvatars.map((url, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 overflow-hidden relative">
                                <Image src={url} alt={`Client ${i}`} fill className="object-cover" unoptimized />
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-zinc-600" />
                            </div>
                        ))
                    )}
                </div>
                {trustedAvatars.length > 0 ? t("trustedBy", { count: trustedAvatars.length * 10 }) : t("defaultTrusted")}
            </div>
        </div>
    );
}
