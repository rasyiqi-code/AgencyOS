import { getCachedUsers } from "@/lib/config/hexclave";
import { prisma } from "@/lib/config/db";
import { getCurrentUser } from "@/lib/shared/auth-helpers";
import { type StackUser } from "@/lib/shared/types";
import { UserPermission } from "@prisma/client";
import { TeamTable } from "@/components/admin/team/team-table";
import { ShieldAlert } from "lucide-react";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
    const currentUser = await getCurrentUser();

    // Super Admin Only Check (Env Var)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    const isSuperAdmin = (currentUser?.primaryEmail && adminEmails.includes(currentUser.primaryEmail)) || currentUser?.id === superAdminId;

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
                <p className="text-zinc-400 max-w-md">
                    Only Super Admins (defined in system environment) can manage team roles.
                    Please contact the site owner.
                </p>
            </div>
        );
    }

    let users: StackUser[] = [];
    try {
        users = await getCachedUsers() as unknown as StackUser[];
    } catch (error) {
        console.error("Failed to fetch users:", error);
    }

    // Fetch all active permissions
    const permissions: UserPermission[] = await prisma.userPermission.findMany();

    // Transform data for UI
    const teamMembers = users.map(user => {
        const userPerms = permissions.filter(p => p.userId === user.id);
        return {
            id: user.id,
            email: user.primaryEmail || '',
            displayName: user.displayName || 'No Name',
            profileImageUrl: user.profileImageUrl,
            isPm: userPerms.some(p => p.key === 'manage_projects'),
            isFinance: userPerms.some(p => p.key === 'manage_billing'),
            isDeveloper: userPerms.some(p => p.key === 'developer'),
        };
    });

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
            <AdminHeaderSetter
                title="Team & Roles"
                actions={
                    <div className="hidden sm:block bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-1.5 text-right shrink-0">
                        <div className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Super Admin Mode</div>
                        <div className="text-sm font-medium text-white leading-tight">Full Access</div>
                    </div>
                }
            />

            <TeamTable data={teamMembers} currentUserId={currentUser?.id} />
        </div>
    );
}
