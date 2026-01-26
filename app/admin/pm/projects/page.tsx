
import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layers, Search, Filter, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function AdminProjectsPage() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px]">Management</Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Mission Board
                        <Layers className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Overview of all client projects, development status, and assignments.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input placeholder="Search projects..." className="pl-9 bg-zinc-900/50 border-white/10" />
                </div>
                <Button variant="outline" className="border-white/10 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter Status
                </Button>
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-zinc-400">Project Title</TableHead>
                            <TableHead className="text-zinc-400">Client ID</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400">Created</TableHead>
                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.length === 0 ? (
                            <TableRow className="border-white/5">
                                <TableCell colSpan={5} className="text-center h-32 text-zinc-500">
                                    No active projects found.
                                </TableCell>
                            </TableRow>
                        ) : projects.map((project) => (
                            <TableRow key={project.id} className="hover:bg-white/5 border-white/5">
                                <TableCell className="font-medium text-white">{project.title}</TableCell>
                                <TableCell className="font-mono text-xs text-zinc-500">{project.userId.slice(0, 8)}...</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        project.status === 'done' ? 'default' : // default usually black/white, might want specific color
                                            project.status === 'dev' ? 'secondary' :
                                                'outline'
                                    } className={
                                        project.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            project.status === 'dev' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                'text-zinc-400 border-zinc-700'
                                    }>
                                        {project.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-400 text-sm">{project.createdAt.toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:text-white hover:bg-white/10 text-zinc-500" title="Manage Project">
                                        <Link href={`/admin/pm/${project.id}`}>
                                            <Settings2 className="w-4 h-4" />
                                        </Link>
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
