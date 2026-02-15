import { ExpertsPageContent } from "@/components/public/experts-page-content";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/config/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const pageSeo = await prisma.pageSeo.findUnique({
        where: {
            path: "/experts"
        }
    });

    const isId = locale === 'id';

    const title = (isId ? pageSeo?.title_id : null) || pageSeo?.title || "Our Experts";
    const description = (isId ? pageSeo?.description_id : null) || pageSeo?.description || "Meet our elite team of senior engineers and vetted experts.";
    const keywords = ((isId ? pageSeo?.keywords_id : null) || pageSeo?.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    return {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        openGraph: pageSeo?.ogImage ? {
            images: [{ url: pageSeo.ogImage }]
        } : undefined,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/experts`
        }
    };
}

export default function ExpertsPage() {
    return <ExpertsPageContent />;
}
