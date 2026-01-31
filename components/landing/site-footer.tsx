import Link from "next/link";
import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
    const t = await getTranslations("Footer");

    return (
        <footer className="border-t border-white/5 bg-black py-12 text-zinc-400">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 uppercase tracking-widest font-bold">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand-grey flex items-center justify-center">
                        <Check className="h-3 w-3 text-brand-yellow stroke-[3]" />
                    </div>
                    <span className="font-semibold text-white tracking-normal">Agency OS</span>
                </div>

                <div className="text-[10px]">
                    {t("copyright")}
                </div>

                <div className="flex gap-6 text-[10px]">
                    <Link href="/privacy" className="hover:text-white transition-colors">{t("privacy")}</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">{t("terms")}</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">{t("contactUs")}</Link>
                </div>
            </div>
        </footer>
    );
}
