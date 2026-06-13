import { getCachedUsers } from "@/lib/config/hexclave";
import { prisma } from "@/lib/config/db";
import { ClientsDataTable } from "@/components/admin/clients/clients-data-table";
import { clientColumns } from "@/components/admin/clients/client-columns";
import { type StackUser } from "@/lib/shared/types";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";
import { Users } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {

    // ... inside function
    let users: StackUser[] = [];
    try {
        users = await getCachedUsers() as unknown as StackUser[];
    } catch (error) {
        console.error("Failed to fetch users:", error);
    }

    // Fetch all projects to map to users
    // Performance Note: In a large scale app, we should only fetch projects for the current page users.
    // Since this list is likely small (<1000), fetching all active projects is acceptable for now.
    const allProjects = await prisma.project.findMany({
        select: {
            userId: true,
            title: true,
            status: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Transform Stack Auth users to our table format
    const formattedClients = (users || []).map((user: StackUser) => {
        const userProjects = allProjects.filter(p => p.userId === user.id);

        return {
            id: user.id,
            displayName: user.displayName,
            email: user.primaryEmail,
            profileImageUrl: user.profileImageUrl || null,
            createdAt: (user.signedUpAt || user.createdAt || null) as string | Date | null,
            lastActiveAt: (user.lastActiveAt || null) as string | Date | null,
            // New field
            projects: userProjects.map(p => ({ title: p.title, status: p.status })),
        };
    });

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
            <AdminHeaderSetter
                title="Client Management"
                actions={
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl px-2.5 py-1 sm:px-4 sm:py-1.5 text-right shrink-0 flex items-center gap-1.5 sm:block">
                        <Users className="w-3.5 h-3.5 text-zinc-500 sm:hidden" />
                        <div className="text-right">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold hidden sm:block">Total Clients</div>
                            <div className="text-xs sm:text-sm font-mono font-bold text-white leading-none sm:leading-tight">{users.length}</div>
                        </div>
                    </div>
                }
            />

            <ClientsDataTable columns={clientColumns} data={formattedClients} />
        </div>
    );
}
