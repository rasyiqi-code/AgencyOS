import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const { id } = await params;
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const project = await prisma.project.findUnique({
        where: { id },
        include: { briefs: true },
    });

    if (!project) {
        notFound();
    }

    // Security Check: Ensure client owns this project
    // (Admin bypass logic could be added here if needed, but Admins have their own route)
    if (project.userId !== user.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-2xl font-bold text-destructive">Unauthorized</h1>
                <p>You do not have permission to view this project.</p>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">← Back</Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                </div>

                <Badge variant={project.status === 'done' ? 'default' : 'secondary'} className="text-md px-3 py-1">
                    {project.status.toUpperCase()}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="font-semibold text-sm text-muted-foreground">Submitted on:</span>
                            <p className="text-sm">{project.createdAt.toLocaleString()}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-sm text-muted-foreground">About:</span>
                            <p className="text-sm mt-1">{project.description}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Briefs</CardTitle>
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
