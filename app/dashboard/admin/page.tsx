import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
    const user = await stackServerApp.getUser();

    // Basic access control: Allow any authenticated user for MVP. 
    // In production, check user.id or email against an admin whitelist.
    if (!user) {
        return <div>Unauthorized</div>;
    }

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            // user: true (if we synced users, but we don't have user table synced yet, relying on userId string)
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project Title</TableHead>
                            <TableHead>Client ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        ) : projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.title}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{project.userId.slice(0, 8)}...</TableCell>
                                <TableCell>
                                    <Badge variant={project.status === 'queue' ? 'secondary' : 'default'}>
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{project.createdAt.toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/admin/${project.id}`}>View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
