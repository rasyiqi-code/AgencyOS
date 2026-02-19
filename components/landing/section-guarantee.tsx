import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SectionGuarantee() {
    const t = await getTranslations("Guarantee");

    return (
        <section className="py-10 sm:py-24 bg-black">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-3xl mx-auto border border-brand-yellow/30 bg-brand-yellow/5 rounded-3xl p-5 sm:p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-brand-yellow/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-yellow rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6 shadow-lg shadow-brand-yellow/20">
                            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3 sm:mb-6">
                            {t("title")}
                        </h2>
                        <h3 className="text-sm sm:text-lg text-brand-yellow font-medium mb-2 sm:mb-4 px-4 sm:px-0 leading-relaxed">
                            &ldquo;{t("subtitle")}&rdquo;
                        </h3>
                        <p className="text-zinc-400 leading-relaxed max-w-xl mx-auto text-xs sm:text-sm md:text-base px-2 sm:px-0">
                            {t("desc")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
