import { prisma } from "@/lib/config/db";
import { EcosystemContent } from "@/components/landing/ecosystem-content";
import { SystemSetting } from "@prisma/client";

export async function SectionEcosystem() {
    // Fetch Agency Name
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find((s: SystemSetting) => s.key === "AGENCY_NAME")?.value || "Agency OS";

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <EcosystemContent agencyName={agencyName} />
        </section>
    );
}
