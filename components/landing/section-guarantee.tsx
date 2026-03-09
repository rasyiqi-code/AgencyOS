import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SectionGuarantee() {
    const t = await getTranslations("Guarantee");

    return (
        <section className="py-8 sm:py-20 bg-black">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-2xl mx-auto relative px-4 py-8">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner">
                            <ShieldCheck className="w-6 h-6 text-brand-yellow" />
                        </div>

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight">
                            {t("title")}
                        </h2>

                        <div className="mb-6">
                            <span className="text-[10px] sm:text-xs font-bold text-brand-yellow uppercase tracking-[0.2em] whitespace-pre-wrap">
                                {t("subtitle")}
                            </span>
                        </div>

                        <p className="text-zinc-400 leading-relaxed max-w-lg mx-auto text-xs sm:text-sm md:text-base antialiased font-light">
                            {t("desc")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
