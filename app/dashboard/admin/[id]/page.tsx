import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusSelector from "./status-selector";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
    // Next.js 15+ params are promises, but this is Next.js 14+ setup likely, let's treat as async just in case or await it.
    // In Next 15, params is a promise. In 14 it's not. 
    // The previous code I wrote used 14 pattern mostly.
    // However, to be safe and forward compatible:
    const { id } = await params;

    const user = await stackServerApp.getUser();
    if (!user) return <div>Unauthorized</div>;

    const project = await prisma.project.findUnique({
        where: { id },
        include: { briefs: true },
    });

    if (!project) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost" size="sm">← Back</Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                </div>

                <StatusSelector projectId={project.id} initialStatus={project.status} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <span className="font-semibold text-sm text-muted-foreground">Client ID:</span>
                            <p className="font-mono text-sm">{project.userId}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-sm text-muted-foreground">Created At:</span>
                            <p className="text-sm">{project.createdAt.toLocaleString()}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-sm text-muted-foreground">Description:</span>
                            <p className="text-sm mt-1">{project.description}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Briefing Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {project.briefs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No briefs found.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {project.briefs.map((brief, index) => (
                                    <div key={brief.id} className="p-4 rounded-lg bg-muted/50 border text-sm">
                                        <div className="mb-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                            Brief #{index + 1}
                                        </div>
                                        <div className="whitespace-pre-wrap">{brief.content}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
