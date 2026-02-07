

import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { Prisma } from "@prisma/client";
import { ProjectsDataTable } from "@/components/admin/pm/projects-data-table";
import { columns } from "@/components/admin/pm/project-columns";
import { type ExtendedProject } from "@/lib/shared/types";
import type { EnrichedProjectInput } from "@/types/payment";

interface StackUser {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
}

import { cookies } from "next/headers";

// Safe to dynamic render as we rely on searchParams
export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string; status?: string; page?: string }>;
}) {
    const params = await searchParams;
    const rawQuery = params.query;
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : undefined;
    const status = params.status;
    const ITEMS_PER_PAGE = 10;
    const skip = 0; // Always fetch initial page from server

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    // 1. Resolve Users for Name-based Search
    // Since Client Names are not consistently stored in DB, we search Stack Auth first
    let matchedUserIds: string[] = [];
    const isUUID = query && /^[0-9a-fA-F-]{36}$/.test(query);

    if (query) {
        if (isUUID) {
            // Optimization: If query is explicitly a UUID, assume it's a User ID and skip fetching all users
            matchedUserIds = [query];
        } else {
            try {
                const allUsers = await stackServerApp.listUsers();
                matchedUserIds = allUsers
                    .filter((u: StackUser) =>
                        (u.displayName && u.displayName.toLowerCase().includes(query.toLowerCase())) ||
                        (u.primaryEmail && u.primaryEmail.toLowerCase().includes(query.toLowerCase())) ||
                        (u.id && u.id.toLowerCase().includes(query.toLowerCase()))
                    )
                    .map((u: StackUser) => u.id);
            } catch (e) {
                console.error("Search user resolution failed", e);
            }
        }
    }

    // Construct Prisma Where Input
    const where: Prisma.ProjectWhereInput = {
        AND: [
            query ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    // Robust User ID Search: Contains OR Exact Match
                    { userId: { contains: query, mode: 'insensitive' } },
                    { userId: { equals: query } },

                    { description: { contains: query, mode: 'insensitive' } },
                    { status: { contains: query, mode: 'insensitive' } },
                    { service: { title: { contains: query, mode: 'insensitive' } } },
                    // Search by Client Name (via resolved IDs)
                    ...(matchedUserIds.length > 0 ? [{ userId: { in: matchedUserIds } }] : []),
                    // Fallback for legacy records that might have clientName
                    { clientName: { contains: query, mode: 'insensitive' } },
                    { invoiceId: { contains: query, mode: 'insensitive' } },
                ]
            } : {},
            (status && status !== 'all') ? { status: { equals: status } } : {},
        ]
    };

    // Parallel Fetching: Total Count & Data
    const [totalProjects, projects] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: ITEMS_PER_PAGE,
            skip,
            include: {
                service: true // Enhanced Data: Fetch Service details
            }
        })
    ]);

    // Stack Auth: Resolve Users for Client Names
    // We do this to ensure even legacy data (where clientName might be null) has a name
    const uniqueUserIds = Array.from(new Set(projects.map(p => p.userId).filter(Boolean)));
    const stackUsers = await Promise.all(
        uniqueUserIds.map(async (id) => {
            try {
                return await stackServerApp.getUser(id);
            } catch (e) {
                console.error(`Failed to fetch user ${id}`, e);
                return null;
            }
        })
    );
    const userMap = new Map(stackUsers.filter(Boolean).map(u => [u!.id, u]));

    // Enrich Projects
    const enrichedProjects = (projects as unknown as EnrichedProjectInput[]).map((p) => {
        if (p.clientName) return p;
        const u = userMap.get(p.userId) as StackUser | undefined;
        return {
            ...p,
            clientName: u?.displayName || u?.primaryEmail || "Unnamed Client"
        };
    }) as unknown as ExtendedProject[];

    return (
        <div className="w-full py-6 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px]">{isId ? 'Manajemen' : 'Management'}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        {isId ? 'Papan Misi' : 'Mission Board'}
                        <Layers className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        {isId ? 'Ringkasan semua proyek klien, status pengembangan, dan penugasan.' : 'Overview of all client projects, development status, and assignments.'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                {/* Search and Filter moved to DashboardHeader */}
            </div>

            <ProjectsDataTable
                columns={columns}
                data={enrichedProjects as unknown as ExtendedProject[]}
                totalCount={totalProjects}
                query={query}
                status={status}
            />
        </div>
    );
}
