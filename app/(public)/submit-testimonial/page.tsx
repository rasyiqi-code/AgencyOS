import { prisma } from "@/lib/config/db";
import { SubmitTestimonialForm } from "./form";
import { stackServerApp } from "@/lib/config/stack";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";

import { ResolvingMetadata } from "next";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    const pageSeo = await prisma.pageSeo.findUnique({
        where: { path: "/submit-testimonial" }
    });

    const isId = locale === 'id';
    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = pageSeo?.ogImage ? [{ url: pageSeo.ogImage }] : previousImages;

    if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
        return {
            title: isId ? "Kirim Testimonial" : "Submit Testimonial",
            openGraph: {
                title: isId ? "Kirim Testimonial" : "Submit Testimonial",
                images: ogImages,
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: isId ? "Kirim Testimonial" : "Submit Testimonial",
                images: ogImages,
            }
        };
    }

    const title = (isId ? pageSeo.title_id : null) || pageSeo.title || (isId ? "Kirim Testimonial" : "Submit Testimonial");
    const description = (isId ? pageSeo.description_id : null) || pageSeo.description || undefined;
    const keywords = ((isId ? pageSeo.keywords_id : null) || pageSeo.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    return {
        title,
        description,
        keywords,
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
        }
    };
}

export const dynamic = "force-dynamic";

export default async function SubmitTestimonialPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in?after_auth_return_to=/submit-testimonial");
    }

    let agencyName = "AgencyOS";

    try {
        const setting = await prisma.systemSetting.findFirst({
            where: { key: "AGENCY_NAME" }
        });
        if (setting?.value) {
            agencyName = setting.value;
        }
    } catch {
        // Fallback to default if DB fetch fails
    }

    return (
        <SubmitTestimonialForm
            agencyName={agencyName}
            userAvatar={user.profileImageUrl}
            userName={user.displayName}
        />
    );
}
