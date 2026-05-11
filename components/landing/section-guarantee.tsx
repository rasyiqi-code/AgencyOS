import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SectionGuarantee() {
    const t = await getTranslations("Guarantee");

    return (
        <section className="py-20 sm:py-32 bg-black relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                        <ShieldCheck className="w-4 h-4 text-brand-yellow" />
                        <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest">
                            {t("title")}
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-6xl md:text-8xl font-black text-brand-yellow mb-8 tracking-tighter leading-[0.9] uppercase drop-shadow-[0_0_25px_rgba(254,215,0,0.4)]">
                        {t("subtitle").split('\n')[0]}
                        {t("subtitle").includes('\n') && (
                            <span className="block text-base sm:text-2xl md:text-3xl font-medium text-white/50 lowercase tracking-normal mt-4">
                                {t("subtitle").split('\n')[1]}
                            </span>
                        )}
                    </h2>

                    <p className="text-zinc-400 leading-relaxed max-w-xl mx-auto text-sm sm:text-base md:text-lg antialiased font-light">
                        {t("desc")}
                    </p>

                    {t("footer") && (
                        <p className="mt-8 text-zinc-500 text-xs sm:text-sm">
                            {t("footer")}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
