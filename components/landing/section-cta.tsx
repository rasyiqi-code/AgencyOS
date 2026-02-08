import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

export async function SectionCTA() {
    const t = await getTranslations("Footer");

    return (
        <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full opacity-20 transform translate-y-1/2" />

            <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight max-w-4xl mx-auto leading-tight">
                    {t("ctaTitle")}
                </h2>

                <div className="flex justify-center">
                    <Link href="/price-calculator">
                        <Button
                            size="lg"
                            className="rounded-full bg-brand-yellow text-black hover:bg-brand-yellow/90 hover:scale-105 transition-all duration-300 font-bold px-8 h-12 text-base shadow-[0_0_20px_rgba(254,215,0,0.3)] hover:shadow-[0_0_35px_rgba(254,215,0,0.5)]"
                        >
                            {t("ctaButton")}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
