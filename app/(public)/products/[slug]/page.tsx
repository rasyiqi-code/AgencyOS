import { getDigitalProductBySlug, getDigitalProducts } from "@/app/actions/digital-products";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowLeft, Package, ShieldCheck, Download, Zap, HeartHandshake, LifeBuoy } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { ProductRecommendations } from "@/components/public/product-recommendations";
import { prisma } from "@/lib/config/db";
import { getTranslations } from "next-intl/server";

import { Metadata } from "next";
import { getLocale } from "next-intl/server";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
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

    return {
        title: name,
        description: cleanDescription,
        openGraph: {
            title: name,
            description: cleanDescription,
            images: product.image ? [{ url: product.image }] : undefined,
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
        <section className="relative min-h-screen overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
                <div className="absolute w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-brand-yellow/5 rounded-full blur-[120px] mix-blend-screen -top-20 -right-20"></div>
                <div className="absolute w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-zinc-600/10 rounded-full blur-[100px] mix-blend-screen bottom-10 -left-10"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 lg:pb-20">
                {/* Back Link */}
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-yellow transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("back")}
                </Link>

                {/* ===== MAIN LAYOUT: 2 Kolom ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Kolom Kiri — Info Produk (3/5) */}
                    <div className="lg:col-span-2 relative z-10">
                        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/60 backdrop-blur-3xl overflow-hidden shadow-2xl">
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
                            <div className="p-6 md:p-8">
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
                                <div className="grid grid-cols-3 gap-2">
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
                        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl p-6 mt-6 shadow-xl">
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
                        <div className="lg:sticky lg:top-24 space-y-5 z-20">
                            {/* Price + CTA Card (Glassmorphism + Brand Yellow) */}
                            <div className="relative rounded-[2rem] border border-brand-yellow/30 bg-gradient-to-b from-zinc-900/80 to-zinc-900/95 backdrop-blur-3xl p-6 lg:p-8 shadow-2xl shadow-brand-yellow/10 overflow-hidden">
                                {/* Inner Glow & Accents */}
                                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-yellow/50 to-transparent"></div>
                                <div className="absolute inset-0 bg-brand-yellow/[0.02] pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t("price")}</div>
                                    <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                                        <PriceDisplay amount={product.price} baseCurrency="USD" compact />
                                        {product.purchaseType === "subscription" && (
                                            <span className="text-sm md:text-base font-normal text-zinc-500 ml-1">/{product.interval === 'month' ? t("monthly") : product.interval}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 mb-6 font-medium">
                                        {product.purchaseType === "subscription" ? t("subscriptionNotice") : t("oneTimeNotice")}
                                    </p>
                                    <Link
                                        href={`/checkout/${product.id}`}
                                        className="group relative flex items-center justify-center w-full bg-brand-yellow text-zinc-950 hover:bg-[#ffdf1a] font-black h-14 rounded-full text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(254,215,0,0.3)] transition-all overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                        <span className="relative z-10">{t("buyNow")}</span>
                                    </Link>
                                </div>
                            </div>


                            {/* Cross-sell: Services */}
                            {services.length > 0 && (
                                <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl p-6 shadow-xl">
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

                {/* ===== MOBILE STICKY BOTTOM CTA ===== */}
                <div className="fixed bottom-0 inset-x-0 z-50 p-3 lg:hidden">
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/10 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_15px)]" />
                    <div className="relative flex items-center justify-between gap-3 p-3.5 rounded-3xl bg-zinc-900/80 border border-brand-yellow/20 backdrop-blur-3xl shadow-2xl shadow-black/50">
                        {/* Price Area */}
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-0.5">{t("price")}</div>
                            <div className="flex items-baseline text-white">
                                <span className="text-[1.35rem] font-black tracking-tighter leading-none"><PriceDisplay amount={product.price} baseCurrency="USD" compact /></span>
                                {product.purchaseType === "subscription" && (
                                    <span className="text-[9px] text-zinc-500 ml-1 font-medium">/{product.interval === 'month' ? t("monthly") : product.interval}</span>
                                )}
                            </div>
                        </div>
                        {/* Buy Now Button */}
                        <Link
                            href={`/checkout/${product.id}`}
                            className="shrink-0 px-6 py-2.5 bg-brand-yellow text-zinc-950 font-extrabold rounded-full text-[11px] uppercase tracking-widest shadow-lg shadow-brand-yellow/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {t("buyNow")}
                        </Link>
                    </div>
                </div>

                {/* ===== BOTTOM: Rekomendasi Produk Lain ===== */}
                <ProductRecommendations
                    products={recommendedProducts}
                    title={t("youMightLike")}
                    subtitle={t("exploreMore")}
                />
            </div>
        </section>
    );
}
