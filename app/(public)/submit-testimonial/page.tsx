import { prisma } from "@/lib/config/db";
import { SubmitTestimonialForm } from "./form";
import { stackServerApp } from "@/lib/config/stack";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const pageSeo = await prisma.pageSeo.findUnique({
        where: { path: "/submit-testimonial" }
    });

    const isId = locale === 'id';

    if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
        return {
            title: isId ? "Kirim Testimonial" : "Submit Testimonial",
        };
    }

    return {
        title: (isId ? pageSeo.title_id : null) || pageSeo.title || (isId ? "Kirim Testimonial" : "Submit Testimonial"),
        description: (isId ? pageSeo.description_id : null) || pageSeo.description || undefined,
        keywords: ((isId ? pageSeo.keywords_id : null) || pageSeo.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean),
        openGraph: pageSeo.ogImage ? {
            images: [{ url: pageSeo.ogImage }]
        } : undefined,
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
