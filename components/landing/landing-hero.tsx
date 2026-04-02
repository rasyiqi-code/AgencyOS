import { HeroContent } from "@/components/landing/hero-content";
import { SystemSetting } from "@prisma/client";
import { getSystemSettings } from "@/lib/server/settings";

export async function LandingHero() {
    // Fetch Agency Name
    // ⚡ Bolt: Use cached getSystemSettings instead of direct DB query
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find((s: SystemSetting) => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="relative pt-6 pb-20 md:pt-24 md:pb-0 overflow-hidden min-h-[90vh] flex items-center justify-center">
            <HeroContent agencyName={agencyName} />
        </section>
    );
}
