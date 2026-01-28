
import Link from "next/link";
import { Shield, LogOut } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header/main";
import { isAdmin, canManageProjects, canManageBilling } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { AdminSidebarNavigation } from "@/components/admin/admin-sidebar-navigation";
import { SidebarContainer } from "@/components/dashboard/sidebar/container";
import { SidebarContentWrapper } from "@/components/dashboard/sidebar/content-wrapper";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Security Guard: Admin Only
    if (!await isAdmin()) {
        redirect('/dashboard');
    }

    // Role Checks
    const pmAccess = await canManageProjects();
    const financeAccess = await canManageBilling();

    return (
        <div className="flex min-h-screen w-full flex-col bg-black">
            <SidebarContainer
                header={
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-indigo-600 flex items-center justify-center shrink-0">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 truncate">
                            Agency Admin
                        </span>
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
                <DashboardHeader />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </SidebarContentWrapper>
        </div>
    );
}
