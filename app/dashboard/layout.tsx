import Link from "next/link";
import { Check } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header/main";
import { SidebarContainer } from "@/components/dashboard/sidebar/container";
import { SidebarContentWrapper } from "@/components/dashboard/sidebar/content-wrapper";
import { DashboardSidebarNavigation, DashboardSidebarFooter } from "@/components/dashboard/sidebar/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-black">
            <SidebarContainer
                header={
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="h-8 w-8 rounded-full bg-brand-grey flex items-center justify-center shrink-0">
                            <Check className="h-5 w-5 text-brand-yellow stroke-[3]" />
                        </div>
                        <span className="text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 truncate transition-all duration-300">
                            Agency OS
                        </span>
                    </Link>
                }
                footer={<DashboardSidebarFooter />}
            >
                <DashboardSidebarNavigation />
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
