import { prisma } from "@/lib/config/db";
import { SubmitTestimonialForm } from "./form";
import { stackServerApp } from "@/lib/config/stack";
import { redirect } from "next/navigation";

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
