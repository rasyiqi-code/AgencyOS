import { getPromotions } from "@/lib/server/marketing";
import { PromoCard } from "@/components/marketing/promo-card";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { Metadata, ResolvingMetadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import { getPageSeo } from "@/lib/server/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const revalidate = 3600; // Cache halaman promosi selama 1 jam (ISR)

export async function generateMetadata(
    _props: unknown,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const t = await getTranslations("Promotions");
    const locale = await getLocale();
    const isId = locale === 'id';
    
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const brand = settings.find(s => s.key === "AGENCY_NAME")?.value || "AgencyOS";

    const pageSeo = await getPageSeo("/promosi");

    const title = (isId ? pageSeo?.title_id : null) || pageSeo?.title || t("metaTitle", { brand });
    const description = (isId ? pageSeo?.description_id : null) || pageSeo?.description || t("metaDesc");
    const keywords = ((isId ? pageSeo?.keywords_id : null) || pageSeo?.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    const previousImages = (await parent).openGraph?.images || [];
    const ogImage = (isId ? pageSeo?.ogImage_id : null) || pageSeo?.ogImage;
    const ogImages = ogImage ? [ogImage] : previousImages;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        openGraph: {
            title,
            description,
            images: ogImages,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ogImages,
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/promosi`,
            languages: {
                'en': `${baseUrl}/en/promosi`,
                'id': `${baseUrl}/id/promosi`,
            }
        }
    };
}

export default async function PromosiPage() {
    const promotions = await getPromotions(true);
    const t = await getTranslations("Promotions");
    const locale = await getLocale();
    const isId = locale === 'id';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <BreadcrumbSchema
                items={[
                    { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
                    { name: isId ? 'Promosi' : 'Promotions', item: `${baseUrl}/${locale}/promosi` },
                ]}
            />
            {promotions.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "name": isId ? "Daftar Promosi & Penawaran Eksklusif" : "Promotions & Exclusive Offers List",
                            "description": isId ? "Daftar promo aktif, penawaran diskon, dan bonus layanan agensi terbaik." : "List of active promotions, discount offers, and best agency service bonuses.",
                            "itemListElement": promotions.map((promo: {
                                id: string;
                                title: string;
                                description: string | null;
                                imageUrl: string;
                                ctaUrl: string | null;
                            }, index: number) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "item": {
                                    "@type": "SaleEvent",
                                    "name": promo.title,
                                    "description": promo.description || promo.title,
                                    "url": promo.ctaUrl ? (promo.ctaUrl.startsWith('http') ? promo.ctaUrl : `${baseUrl}${promo.ctaUrl}`) : undefined,
                                    "image": promo.imageUrl,
                                }
                            }))
                        })
                    }}
                />
            )}
            <div className="pt-6 sm:pt-32 pb-16 sm:pb-20">
                <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="relative mb-10 sm:mb-20 text-center">
                    <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-yellow/10 blur-[120px]" />
                    <h1 className="mb-4 text-3xl sm:text-5xl font-black tracking-tight text-white md:text-7xl">
                        {t("title")}{" "}
                        <span className="bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow bg-clip-text text-transparent">
                            {t("titleHighlight")}
                        </span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm sm:text-lg text-zinc-400 leading-relaxed px-2">
                        {t("subtitle")}
                    </p>
                </div>


                {/* Promotions Grid - Masonry Layout */}
                {promotions.length > 0 ? (
                    <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
                        {promotions.map((promo: {
                            id: string;
                            title: string;
                            description: string | null;
                            imageUrl: string;
                            ctaText: string | null;
                            ctaUrl: string | null;
                            couponCode: string | null;
                            endDate: Date | null;
                        }) => (
                            <PromoCard 
                                key={promo.id} 
                                promotion={{
                                    ...promo,
                                    endDate: promo.endDate ? promo.endDate.toISOString() : null
                                }} 
                            />
                        ))}

                    </div>


                ) : (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 sm:px-6 text-center">
                        <div className="mb-6 rounded-full bg-brand-yellow/5 p-6 border border-brand-yellow/10">
                            <svg className="h-12 w-12 text-brand-yellow/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-xl sm:text-2xl font-semibold text-white">{t("emptyTitle")}</h2>
                        <p className="text-sm text-gray-400">{t("emptyDesc")}</p>
                    </div>
                )}

                {/* Footer Note */}
                <div className="mt-12 sm:mt-20 px-0 py-8 sm:py-12 text-center">
                    <h3 className="mb-3 text-xl sm:text-2xl font-black text-white">{t("newsletterTitle")}</h3>
                    <p className="mb-8 text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">{t("newsletterDesc")}</p>
                    
                    <NewsletterForm />
                </div>


            </div>
        </div>
    </div>
    );
}
