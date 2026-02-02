import { QuoteForm } from "@/components/quote/quote-form";
import { isAdmin } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
    const pageSeo = await prisma.pageSeo.findUnique({
        where: { path: "/price-calculator" }
    });

    return {
        title: pageSeo?.title || "Price Calculator",
        description: pageSeo?.description || "Get an instant quote for your custom project. Configure features and see estimated costs immediately.",
        keywords: pageSeo?.keywords?.split(",").map((k: string) => k.trim()) || undefined,
        openGraph: pageSeo?.ogImage ? {
            images: [{ url: pageSeo.ogImage }]
        } : undefined,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/price-calculator`
        }
    };
}

export default async function QuotePage() {
    const isUserAdmin = await isAdmin();

    return (
        <div className="min-h-screen bg-black selection:bg-lime-500/30">
            <QuoteForm isAdmin={isUserAdmin} />
        </div>
    );
}
