import Link from "next/link";
import { Check } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header/main";
import { SidebarContainer } from "@/components/dashboard/sidebar/container";
import { SidebarContentWrapper } from "@/components/dashboard/sidebar/content-wrapper";
import { DashboardSidebarNavigation, DashboardSidebarFooter } from "@/components/dashboard/sidebar/navigation";
import { prisma } from "@/lib/config/db";
import Image from "next/image";

export default async function DashboardLayout({
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
                            {agencyName}
                        </span>
                    </Link>
                }
                footer={<DashboardSidebarFooter />}
            >
                <DashboardSidebarNavigation />
            </SidebarContainer>

            <SidebarContentWrapper>
                <DashboardHeader agencyName={agencyName} logoUrl={logoUrl} />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </SidebarContentWrapper>
        </div>
    );
}
