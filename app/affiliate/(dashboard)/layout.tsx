import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header/main";
import { SidebarContainer } from "@/components/dashboard/sidebar/container";
import { SidebarContentWrapper } from "@/components/dashboard/sidebar/content-wrapper";
import { AffiliateSidebarNavigation } from "@/components/marketing/affiliate-sidebar-navigation";
import { DashboardSidebarFooter } from "@/components/dashboard/sidebar/navigation";
import { prisma } from "@/lib/config/db";

export default async function AffiliateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME", "LOGO_URL"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";
    const logoUrl = settings.find(s => s.key === "LOGO_URL")?.value;

    return (
        <div className="flex min-h-screen w-full flex-col bg-black">
            <SidebarContainer
                header={
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        {logoUrl ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full">
                                <Image
                                    src={logoUrl}
                                    alt={agencyName}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-brand-grey flex items-center justify-center shrink-0">
                                <Check className="h-5 w-5 text-brand-yellow stroke-[3]" />
                            </div>
                        )}
                        <span className="text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 truncate transition-all duration-300">
                            {agencyName} <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded ml-2">Partner</span>
                        </span>
                    </Link>
                }
                footer={<DashboardSidebarFooter />}
            >
                <AffiliateSidebarNavigation />
            </SidebarContainer>

            <SidebarContentWrapper>
                <DashboardHeader />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </SidebarContentWrapper>
        </div>
    );
}
