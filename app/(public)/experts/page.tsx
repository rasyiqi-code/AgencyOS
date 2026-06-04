import { ExpertsPageContent } from "@/components/public/experts-page-content";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getPageSeo } from "@/lib/server/seo";

export const revalidate = 3600; // Cache halaman daftar expert selama 1 jam (ISR)

import { ResolvingMetadata } from "next";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    // ⚡ Optimasi: Gunakan getPageSeo yang ter-cache (unstable_cache, TTL 1 jam)
    const pageSeo = await getPageSeo("/experts");

    const isId = locale === 'id';

    const title = (isId ? pageSeo?.title_id : null) || pageSeo?.title || "Our Experts";
    const description = (isId ? pageSeo?.description_id : null) || pageSeo?.description || "Meet our elite team of senior engineers and vetted experts.";
    const keywords = ((isId ? pageSeo?.keywords_id : null) || pageSeo?.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = pageSeo?.ogImage ? [{ url: pageSeo.ogImage }] : previousImages;

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
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/experts`
        }
    };
}

export default function ExpertsPage() {
    return <ExpertsPageContent />;
}
