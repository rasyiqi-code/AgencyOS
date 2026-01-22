import { Button } from "@/components/ui/button";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
    const user = await stackServerApp.getUser();

    // Fetch projects from DB (Server Action / Server Component)
    // For MVP, we fetch all projects where userId matches (or all if admin - logic tbd)
    // Using 'findMany' directly for now.
    const projects = await prisma.project.findMany({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
                <Link href="/dashboard/new">
                    <Button>Create Project</Button>
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <span className="text-xl">👻</span>
                    </div>
                    <h3 className="text-lg font-bold">No projects yet</h3>
                    <p className="text-sm text-muted-foreground">
                        You haven't created any projects. Start by creating one.
                    </p>
                    <Link href="/dashboard/new">
                        <Button>Create Project</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/dashboard/${project.id}`} className="block h-full">
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow h-full">
                                <div className="flex flex-col space-y-1.5">
                                    <h3 className="font-semibold leading-none tracking-tight">{project.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${project.status === 'done' ? 'bg-green-100 text-green-800' :
                                        project.status === 'dev' ? 'bg-blue-100 text-blue-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                        {project.status}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {project.createdAt.toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
