
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RepoActivity } from "@/components/dashboard/missions/repo-activity";
import { WorkbenchStatus } from "@/components/dashboard/missions/workbench-status";
import Image from "next/image";
import { ProjectHeader } from "@/components/dashboard/missions/header";
import { ProjectPreview } from "@/components/dashboard/missions/project-preview";
import { FileText, MessageSquare, Terminal, Github, Globe, CalendarClock } from "lucide-react";
import { ServiceFeaturesList } from "@/components/dashboard/shared/service-features";
import { DailyLogFeed } from "@/components/dashboard/missions/daily-log-feed";
import { FeedbackBoard } from "@/components/feedback/board";
import { type ExtendedProject } from "@/lib/types";

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
        include: {
            service: true,
            briefs: true,
            feedback: {
                orderBy: { createdAt: 'desc' },
                include: { comments: { orderBy: { createdAt: 'asc' } } }
            },
            dailyLogs: {
                orderBy: { createdAt: 'desc' }
            }
        },
    }) as unknown as ExtendedProject;

    if (!project) {
        notFound();
    }

    if (project.userId !== user.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-2xl font-bold text-destructive">Unauthorized</h1>
                <p>You do not have permission to view this mission.</p>
                <Link href="/dashboard">
                    <Button variant="outline">Return to Base</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-6 min-h-screen">
            <ProjectHeader project={project}>
                {project.repoUrl && (
                    <Link href={project.repoUrl} target="_blank">
                        <Button variant="outline" size="icon" className="h-7 w-7 bg-zinc-900 border-white/10 text-zinc-400 hover:text-white">
                            <Github className="w-3 h-3" />
                        </Button>
                    </Link>
                )}
                {project.deployUrl && (
                    <Link href={project.deployUrl} target="_blank">
                        <Button variant="outline" size="icon" className="h-7 w-7 bg-zinc-900 border-white/10 text-zinc-400 hover:text-white">
                            <Globe className="w-3 h-3" />
                        </Button>
                    </Link>
                )}
            </ProjectHeader>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">

                {/* Main Column: Intel & Feedback */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Mission Briefing */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <FileText className="w-3.5 h-3.5" />
                            <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">Mission Briefing</h2>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <div className="text-zinc-300 bg-black/20 p-2.5 rounded-lg border border-white/5 font-mono text-xs leading-relaxed">
                                {project.description || "No description provided."}
                            </div>
                        </div>

                        {project.briefs.length > 0 && (
                            <div className="mt-3 flex flex-col gap-2">
                                {project.briefs.map((brief, index) => (
                                    <div key={brief.id} className="p-2.5 rounded-lg bg-blue-900/10 border border-blue-500/10 text-[11px]">
                                        <div className="mb-0.5 font-bold text-[9px] uppercase tracking-wider text-blue-400 opacity-70">
                                            Supplemental Intel #{index + 1}
                                        </div>
                                        <div className="whitespace-pre-wrap text-zinc-300 leading-normal">{brief.content}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Service Intel */}
                    {project.service && (
                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4 mb-4 overflow-hidden relative group">
                            <div className="flex flex-col md:flex-row gap-4 relative z-10">
                                {project.service.image && (
                                    <div className="w-full md:w-40 h-28 rounded-lg bg-zinc-800/50 overflow-hidden border border-white/5 flex-shrink-0 relative">
                                        <Image
                                            src={project.service.image}
                                            alt={project.service.title}
                                            fill
                                            className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5 opacity-80">Authenticated Service</div>
                                        <h2 className="text-lg font-bold text-white tracking-tight">{project.service.title}</h2>
                                    </div>
                                    <div className="text-zinc-400 text-xs leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: project.service.description }} />

                                    <ServiceFeaturesList
                                        features={(project.service.features as string[]) || []}
                                    />
                                </div>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                        </div>
                    )}

                    {/* Daily Updates */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <CalendarClock className="w-3.5 h-3.5" />
                            <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">Mission Updates</h2>
                        </div>
                        <div className="h-64">
                            <DailyLogFeed projectId={project.id} initialLogs={project.dailyLogs} />
                        </div>
                    </div>
                    {/* Feedback Comms */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">Communications Channel</h2>
                        </div>
                        <FeedbackBoard projectId={project.id} feedbacks={project.feedback} />
                    </div>

                </div>

                {/* Sidebar: Workbench */}
                <div className="space-y-4 sticky top-6 self-start">

                    <ProjectPreview url={project.previewUrl || null} />

                    {/* Workbench Widget */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Terminal className="w-3.5 h-3.5" />
                            <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">Workbench</h2>
                        </div>

                        {(project.repoOwner && project.repoName) || project.deployUrl ? (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-zinc-500 uppercase tracking-wider font-medium">Status</span>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0">Online</Badge>
                                    </div>
                                    <WorkbenchStatus projectId={project.id} deployUrl={project.deployUrl} />
                                </div>
                                <div className="border-t border-white/5 pt-3">
                                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Repository Activity</p>
                                    {project.repoOwner && project.repoName && (
                                        <RepoActivity owner={project.repoOwner} repo={project.repoName} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-zinc-950/30 rounded-lg border border-white/5 border-dashed">
                                <Terminal className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                                <p className="text-xs text-zinc-500">Repository not linked.</p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
