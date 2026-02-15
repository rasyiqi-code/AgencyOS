import { getDigitalProducts } from "@/app/actions/digital-products";
import { ProductCard } from "@/components/public/product-card";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/config/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const pageSeo = await prisma.pageSeo.findUnique({
        where: {
            path: "/products"
        }
    });

    const isId = locale === 'id';

    const title = (isId ? pageSeo?.title_id : null) || pageSeo?.title || "Digital Products";
    const description = (isId ? pageSeo?.description_id : null) || pageSeo?.description || "Premium templates, plugins, and tools to accelerate your projects.";
    const keywords = ((isId ? pageSeo?.keywords_id : null) || pageSeo?.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    return {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        openGraph: pageSeo?.ogImage ? {
            images: [{ url: pageSeo.ogImage }]
        } : undefined,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products`
        }
    };
}

/**
 * Halaman publik daftar produk digital.
 * Layout mengikuti style halaman Services untuk konsistensi visual.
 */
export default async function ProductsPage() {
    const products = await getDigitalProducts(true);
    const t = await getTranslations("Products");

    return (
        <section className="relative min-h-screen">
            {/* Hero Section — mengikuti style Services page */}
            <div className="relative z-10 text-center pt-20 pb-12 px-4">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-zinc-500 hover:text-brand-yellow transition-colors mb-6"
                >
                    ← {t("back")}
                </Link>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-brand-yellow" />
                    {t("title")}
                </h1>
                <p className="text-zinc-400 text-lg mt-4 max-w-2xl mx-auto whitespace-pre-line">
                    {t("subtitle")}
                </p>
            </div>

            {/* Product Grid */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {products.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 text-lg">
                        {t("empty")}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {products.map((product: { id: string; name: string; slug: string; description: string | null; price: number; purchaseType: string; interval: string | null; image: string | null; type: string }) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
