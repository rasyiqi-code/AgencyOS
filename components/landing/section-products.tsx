
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/config/db";
import { ProductList } from "./product-list";

export async function ProductCatalog() {
    const t = await getTranslations("ProductCatalog");

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
            </div >
        </section >
    );
}
