import { QuoteForm } from "@/components/quote/quote-form";
import { isAdmin } from "@/lib/shared/auth-helpers";

export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { getPageSeo } from "@/lib/server/seo";
import { getLocale } from "next-intl/server";

import { ResolvingMetadata } from "next";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    // ⚡ Optimasi: Gunakan getPageSeo yang ter-cache (unstable_cache, TTL 1 jam)
    const pageSeo = await getPageSeo("/price-calculator");

    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = pageSeo?.ogImage ? [{ url: pageSeo.ogImage }] : previousImages;
    const title = pageSeo?.title || "Price Calculator";
    const description = pageSeo?.description || "Get an instant quote for your custom project. Configure features and see estimated costs immediately.";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return {
        title,
        description,
        keywords: pageSeo?.keywords?.split(",").map((k: string) => k.trim()) || undefined,
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
            canonical: `${baseUrl}/${locale}/price-calculator`,
            languages: {
                'en': `${baseUrl}/en/price-calculator`,
                'id': `${baseUrl}/id/price-calculator`,
            }
        }
    };
}

export default async function QuotePage() {
    const isUserAdmin = await isAdmin();

    return (
        <div className="min-h-screen bg-black selection:bg-blue-500/30">
            <QuoteForm isAdmin={isUserAdmin} />
        </div>
    );
}
