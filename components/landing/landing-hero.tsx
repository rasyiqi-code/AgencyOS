import { HeroContent } from "@/components/landing/hero-content";
import { prisma } from "@/lib/config/db";
import { SystemSetting } from "@prisma/client";

export async function LandingHero() {
    // Fetch Agency Name
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find((s: SystemSetting) => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="relative pt-10 pb-20 md:pt-48 md:pb-0 overflow-hidden min-h-[90vh] flex items-center justify-center">
            <HeroContent agencyName={agencyName} />
        </section>
    );
}
