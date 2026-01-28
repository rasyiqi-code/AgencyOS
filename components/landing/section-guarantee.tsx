import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SectionGuarantee() {
    const t = await getTranslations("Guarantee");

    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-3xl mx-auto border border-indigo-500/30 bg-indigo-500/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
                            {t("title")}
                        </h2>
                        <h3 className="text-lg text-indigo-300 font-medium mb-4">
                            &ldquo;{t("subtitle")}&rdquo;
                        </h3>
                        <p className="text-zinc-400 leading-relaxed max-w-xl mx-auto text-sm md:text-base">
                            {t("desc")}
                        </p>
                        <p className="text-zinc-500 text-sm mt-4 italic">
                            {t("footer")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
