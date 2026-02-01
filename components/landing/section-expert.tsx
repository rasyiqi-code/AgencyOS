import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function ExpertProfile() {
    const t = await getTranslations("Expert");

    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto rounded-3xl bg-zinc-900/30 border border-white/5 p-8 md:p-12">
                    <div className="shrink-0 text-center">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-white/10 mx-auto mb-4 bg-zinc-800 relative shadow-2xl">
                            <Image
                                src="/expert-photo.png"
                                alt="Rasyiqi"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <h3 className="text-white font-bold text-lg">{t("name")}</h3>
                        <p className="text-indigo-400 text-sm">{t("role")}</p>
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white">
                            &ldquo;{t("title")}&rdquo;
                        </h2>
                        <div className="space-y-4 text-zinc-400 leading-relaxed">
                            <p>
                                {t("q")}
                            </p>
                            <p>
                                {t.rich("a", {
                                    strong: (chunks) => <strong className="text-white">{chunks}</strong>
                                })}
                            </p>
                            <p>
                                {t("desc")}
                            </p>
                            <p className="text-white font-medium pt-2">
                                {t("footer")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
