import { BarChart3, Newspaper, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function ProductCatalog() {
    const t = await getTranslations("ProductCatalog");

    const products = [
        {
            title: t("products.ops.title"),
            target: t("products.ops.target"),
            desc: t("products.ops.desc"),
            price: t("products.ops.price"),
            cta: t("products.ops.cta"),
            icon: BarChart3,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            link: "/price-calculator"
        },
        {
            title: t("products.publisher.title"),
            target: t("products.publisher.target"),
            desc: t("products.publisher.desc"),
            price: t("products.publisher.price"),
            cta: t("products.publisher.cta"),
            icon: Newspaper,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            link: "/price-calculator"
        },
        {
            title: t("products.saas.title"),
            target: t("products.saas.target"),
            desc: t("products.saas.desc"),
            price: t("products.saas.price"),
            cta: t("products.saas.cta"),
            icon: Rocket,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            link: "/price-calculator"
        }
    ];

    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400">{t("subtitle")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {products.map((p, i) => (
                        <div key={i} className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-8 hover:bg-zinc-900 transition-all hover:border-white/20">
                            <div className={`w-12 h-12 rounded-lg ${p.bg} flex items-center justify-center mb-6`}>
                                <p.icon className={`w-6 h-6 ${p.color}`} />
                            </div>
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{p.target}</div>
                            <h3 className="text-2xl font-bold text-white mb-4">{p.title}</h3>
                            <p className="text-zinc-400 mb-8 min-h-[80px] text-sm leading-relaxed">{p.desc}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className="text-white font-bold">{p.price}</span>
                                <Link href={p.link}>
                                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-black">
                                        {p.cta}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
