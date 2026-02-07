import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { ClientsDataTable } from "@/components/admin/clients/clients-data-table";
import { clientColumns } from "@/components/admin/clients/client-columns";
import { type StackUser } from "@/lib/shared/types";

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {

    // ... inside function
    let users: StackUser[] = [];
    try {
        users = await stackServerApp.listUsers();
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Client Management
                    </h1>
                    <p className="text-zinc-400">
                        View and manage registered client accounts.
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">Total Clients</div>
                    <div className="text-2xl font-mono font-bold text-white">{users.length}</div>
                </div>
            </div>

            <ClientsDataTable columns={clientColumns} data={formattedClients} />
        </div>
    );
}
