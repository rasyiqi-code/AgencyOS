import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/config/db";
import { ProductList } from "./product-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function ProductCatalog() {
    const t = await getTranslations("ProductCatalog");
    const locale = await getLocale();

    // Fetch active services from DB
    const services = await prisma.service.findMany({
        where: { isActive: true },
        take: 3,
        orderBy: { price: 'asc' }
    });

    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400">{t("subtitle")}</p>
                </div>

                <div className="w-full">
                    <ProductList initialServices={services} />
                </div>

                <div className="mt-16 text-center">
                    <Link href={`/${locale}/services`}>
                        <Button variant="outline" size="lg" className="rounded-full border-white/10 bg-zinc-900/50 backdrop-blur-sm text-white hover:bg-brand-yellow hover:text-black transition-all group px-8 py-6 text-base font-bold shadow-xl">
                            {t("viewAllServices")}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div >
        </section >
    );
}
