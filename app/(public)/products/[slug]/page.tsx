import { getDigitalProductBySlug, getDigitalProducts } from "@/app/actions/digital-products";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Package, ShieldCheck, Download, Zap, HeartHandshake, LifeBuoy } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { ProductRecommendations } from "@/components/public/product-recommendations";
import { prisma } from "@/lib/config/db";
import { getTranslations } from "next-intl/server";

import { Metadata } from "next";
import { getLocale } from "next-intl/server";

interface PageProps {
    params: Promise<{ slug: string }>;
}

import { ResolvingMetadata } from "next";

export async function generateMetadata(
    props: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const params = await props.params;
    const product = await getDigitalProductBySlug(params.slug);
    const locale = await getLocale();

    if (!product || !product.isActive) {
        return { title: "Product Not Found" };
    }

    const isId = locale === 'id';
    const name = (isId ? product.name_id : null) || product.name;
    const description = (isId ? product.description_id : null) || product.description || "";

    // Clean description for meta tag (remove HTML tags if any, though digital products usually use plain text)
    const cleanDescription = description.replace(/<[^>]*>?/gm, '').slice(0, 160);

    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = product.image ? [{ url: product.image }] : previousImages;

    return {
        title: name,
        description: cleanDescription,
        openGraph: {
            title: name,
            description: cleanDescription,
            images: ogImages,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/${params.slug}`
        }
    };
}

/**
 * Halaman detail produk digital.
 * Menampilkan informasi lengkap produk, highlights, dan rekomendasi cross-sell.
 */
export default async function ProductDetailPage(props: PageProps) {
    const params = await props.params;
    const product = await getDigitalProductBySlug(params.slug);
    const t = await getTranslations("ProductDetail");
    const locale = await getLocale();
    const isId = locale === 'id';

    if (!product || !product.isActive) {
        notFound();
    }

    const name = (isId ? product.name_id : null) || product.name;
    const description = (isId ? product.description_id : null) || product.description;

    // Ambil produk lain untuk rekomendasi (exclude produk saat ini)
    const allProducts = await getDigitalProducts(true);
    const recommendedProducts = allProducts.filter((p: { id: string }) => p.id !== product.id);

    // Ambil services aktif untuk cross-sell
    const services = await prisma.service.findMany({
        where: { isActive: true },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            description: true,
            price: true,
            interval: true,
            image: true,
        },
    });

    const purchaseLabel = product.purchaseType === "subscription"
        ? (product.interval === "month" ? t("monthly") : product.interval || t("monthly"))
        : t("oneTime");

    return (
        <section className="relative min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-24 md:pb-20">

                {/* ===== MAIN LAYOUT: 2 Kolom ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
                    {/* Kolom Kiri — Info Produk (3/5) */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                            {/* Thumbnail */}
                            <div className="relative aspect-[16/9] overflow-hidden">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 700px"
                                        priority
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                                        <Sparkles className="w-16 h-16 text-zinc-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="p-5 lg:p-8">
                                {/* Badges */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="px-2.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-bold text-brand-yellow uppercase tracking-widest">
                                        {purchaseLabel}
                                    </div>
                                    <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                        {product.type}
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
                                    {name}
                                </h1>

                                {/* Description */}
                                {description && (
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                        {description}
                                    </p>
                                )}

                                {/* Highlights */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3">
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                                        <Download className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                                        <span className="text-[11px] text-zinc-400">{t("instantDownload")}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                                        <span className="text-[11px] text-zinc-400">{t("licenseIncluded")}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                                        <Package className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                                        <span className="text-[11px] text-zinc-400">{t("fullSourceCode")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Signals — Why Choose Us */}
                        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 mt-5">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{t("whyChooseUs")}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-lg bg-brand-yellow/10 shrink-0">
                                        <Zap className="w-3.5 h-3.5 text-brand-yellow" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-white">{t("instantAccess")}</div>
                                        <div className="text-[11px] text-zinc-500">{t("instantAccessDesc")}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-lg bg-brand-yellow/10 shrink-0">
                                        <LifeBuoy className="w-3.5 h-3.5 text-brand-yellow" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-white">{t("prioritySupport")}</div>
                                        <div className="text-[11px] text-zinc-500">{t("prioritySupportDesc")}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-lg bg-brand-yellow/10 shrink-0">
                                        <HeartHandshake className="w-3.5 h-3.5 text-brand-yellow" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-white">{t("satisfaction")}</div>
                                        <div className="text-[11px] text-zinc-500">{t("satisfactionDesc")}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan — Sidebar (2/5) */}
                    <div className="lg:col-span-1 space-y-5">
                        {/* Sticky Price Card */}
                        <div className="lg:sticky lg:top-24 space-y-5">
                            {/* Price + CTA Card */}
                            <div className="hidden lg:block rounded-2xl border border-brand-yellow/20 bg-zinc-900/60 backdrop-blur-xl p-5 shadow-xl">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{t("price")}</div>
                                <div className="text-3xl font-black text-white tracking-tighter mb-1">
                                    <PriceDisplay amount={product.price} baseCurrency="USD" compact />
                                    {product.purchaseType === "subscription" && (
                                        <span className="text-sm font-normal text-zinc-500 ml-1">/{product.interval === 'month' ? t("monthly") : product.interval}</span>
                                    )}
                                </div>
                                <p className="text-[11px] text-zinc-600 mb-5">
                                    {product.purchaseType === "subscription" ? t("subscriptionNotice") : t("oneTimeNotice")}
                                </p>
                                <Link
                                    href={`/checkout/${product.id}`}
                                    className="flex items-center justify-center gap-2 w-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-12 rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-brand-yellow/20 transition-colors"
                                >
                                    {t("buyNow")}
                                </Link>
                            </div>


                            {/* Cross-sell: Services */}
                            {services.length > 0 && (
                                <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{t("needCustom")}</h3>
                                    <div className="space-y-3">
                                        {services.map((service: { id: string; title: string; price: number; image: string | null }) => (
                                            <Link
                                                key={service.id}
                                                href="/services"
                                                className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-brand-yellow/20 transition-colors"
                                            >
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-800/50 shrink-0 flex items-center justify-center">
                                                    {service.image ? (
                                                        <Image src={service.image} alt={service.title} fill unoptimized className="object-cover" sizes="40px" />
                                                    ) : (
                                                        <Sparkles className="w-4 h-4 text-zinc-700" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold text-white group-hover:text-brand-yellow transition-colors truncate">
                                                        {service.title}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500">
                                                        From <PriceDisplay amount={service.price} baseCurrency="USD" compact />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== BOTTOM: Rekomendasi Produk Lain ===== */}
                <ProductRecommendations
                    products={recommendedProducts}
                    title={t("youMightLike")}
                    subtitle={t("exploreMore")}
                />
            </div>

            {/* ===== MOBILE STICKY CTA ===== */}
            <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 lg:hidden z-[100]">
                <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">{t("price")}</div>
                        <div className="text-xl font-black text-white tracking-tighter flex items-end gap-1">
                            <PriceDisplay amount={product.price} baseCurrency="USD" compact />
                            {product.purchaseType === "subscription" && (
                                <span className="text-xs font-normal text-zinc-500 pb-0.5">/{product.interval === 'month' ? t("monthly") : product.interval}</span>
                            )}
                        </div>
                    </div>
                    <Link
                        href={`/checkout/${product.id}`}
                        className="flex-1 max-w-[160px] flex items-center justify-center gap-2 bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-11 rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-brand-yellow/20 transition-colors"
                    >
                        {t("buyNow")}
                    </Link>
                </div>
            </div>
        </section>
    );
}
