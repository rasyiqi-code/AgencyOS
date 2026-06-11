"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function SectionCTA() {
    const t = useTranslations("Footer");
    const params = useParams();
    const locale = params?.locale as string || "id";

    return (
        <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full opacity-20 transform translate-y-1/2" />

            <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight max-w-4xl mx-auto leading-tight">
                    {t("ctaTitle")}
                </h2>

                <div className="flex justify-center">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full bg-brand-yellow text-black hover:bg-brand-yellow/90 hover:scale-105 transition-all duration-300 font-bold px-6 h-10 text-sm sm:px-8 sm:h-12 sm:text-base shadow-[0_0_20px_rgba(254,215,0,0.3)] hover:shadow-[0_0_35px_rgba(254,215,0,0.5)] cursor-pointer"
                    >
                        <Link href={`/${locale}/contact`}>
                            {t("ctaButton")}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

