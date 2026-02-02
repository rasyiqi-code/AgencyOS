
import Link from "next/link";
import { Shield, LogOut } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header/main";
import { isAdmin, canManageProjects, canManageBilling } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { AdminSidebarNavigation } from "@/components/admin/admin-sidebar-navigation";
import { SidebarContainer } from "@/components/dashboard/sidebar/container";
import { SidebarContentWrapper } from "@/components/dashboard/sidebar/content-wrapper";
import { prisma } from "@/lib/db";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME", "LOGO_URL"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";
    const logoUrl = settings.find(s => s.key === "LOGO_URL")?.value;

    // Security Guard: Admin Only
    if (!await isAdmin()) {
        redirect('/dashboard');
    }

    // Role Checks
    const pmAccess = await canManageProjects();
    const financeAccess = await canManageBilling();

    // AI Configuration Check
    const activeAiKey = await prisma.systemKey.findFirst({
        where: { isActive: true, provider: "google" }
    });
    const isAiConfigured = !!activeAiKey;

    return (
        <div className="flex min-h-screen w-full flex-col bg-black">
            {!isAiConfigured && (
                <div className="bg-amber-950/30 border-b border-amber-500/20 py-2 px-6 flex justify-between items-center z-50">
                    <div className="flex items-center gap-2 text-amber-500 text-xs">
                        <Shield className="w-3.5 h-3.5 animate-pulse" />
                        <span><strong>IMPORTANT:</strong> No active AI API Keys found. Customer Support and Price Estimator features are <strong>offline</strong> for users.</span>
                    </div>
                    <Link
                        href="/admin/system/keys"
                        className="text-[10px] bg-amber-500 hover:bg-amber-400 text-black px-2 py-0.5 rounded font-bold uppercase transition-colors"
                    >
                        Fix Now
                    </Link>
                </div>
            )}
            <SidebarContainer
                header={
                    <Link href="/admin" className="flex items-center gap-2 group">
                        {logoUrl ? (
                            <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                                <Image
                                    src={logoUrl}
                                    alt={agencyName}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                        )}
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-sm font-bold text-white truncate max-w-[140px] leading-tight">
                                {agencyName}
                            </span>
                            <div className="flex">
                                <Badge variant="outline" className="h-[18px] px-1.5 text-[9px] uppercase tracking-widest border-red-500/50 text-red-500 bg-red-500/10 font-black">
                                    Admin
                                </Badge>
                            </div>
                        </div>
                    </Link>
                }
                footer={
                    <Link
                        href="/dashboard"
                        className="flex w-full items-center gap-3 rounded-lg px-5 py-2 text-zinc-500 transition-all hover:text-white hover:bg-white/5"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className="truncate group-data-[collapsed=true]:hidden transition-all duration-300">
                            Exit to Client View
                        </span>
                    </Link>
                }
            >
                <AdminSidebarNavigation
                    pmAccess={pmAccess}
                    financeAccess={financeAccess}
                />
            </SidebarContainer>

            <SidebarContentWrapper>
                <DashboardHeader allowedToSwitchViews={pmAccess && financeAccess} />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </SidebarContentWrapper>
        </div>
    );
}
