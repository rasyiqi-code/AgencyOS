
import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RepoActivity } from "@/components/dashboard/missions/repo-activity";
import { WorkbenchStatus } from "@/components/dashboard/missions/workbench-status";
import { SafeImage } from "@/components/ui/safe-image";
import { ProjectHeader } from "@/components/dashboard/missions/header";
import { ProjectPreview } from "@/components/dashboard/missions/project-preview";
import { Activity, Clock, Calendar, Terminal, MessageSquare, Github, Globe } from "lucide-react";
import { ServiceFeaturesList } from "@/components/dashboard/shared/service-features";
import { DailyLogFeed } from "@/components/dashboard/missions/daily-log-feed";
import { FeedbackBoard } from "@/components/feedback/board";
import { type ExtendedProject, type ProjectFile } from "@/lib/shared/types";
import { FileManager } from "@/app/admin/pm/[id]/file-manager";
import { TechnicalSpecsViewer } from "@/components/dashboard/shared/technical-specs-viewer";
import { AssignedTeamCard } from "@/components/dashboard/shared/assigned-team-card";

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
            },
            estimate: true,
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

    const statusLabel = {
        queue: "Queue",
        dev: "In Development",
        review: "In Review",
        done: "Done",
    }[project.status] || project.status;


    const assignedProfile = project.developerId ? await prisma.squadProfile.findUnique({
        where: { userId: project.developerId }
    }) : null;

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

                {/* Main Column: Content */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Overview Section */}
                    <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                        {project.description && !project.description.startsWith("Purchase of") && (
                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{project.description}</p>
                        )}

                        {project.service?.description && (
                            <div className="text-zinc-300 text-sm leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: project.service.description }} />
                        )}

                        {!project.description && !project.service?.description && (
                            <p className="text-zinc-500 text-sm italic">No description provided.</p>
                        )}
                    </div>

                    {/* Daily Updates */}
                    <div className="h-[500px]">
                        <DailyLogFeed projectId={project.id} initialLogs={project.dailyLogs} />
                    </div>

                    {/* Feedback Comms */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">Communications Channel</h2>
                        </div>
                        <FeedbackBoard projectId={project.id} feedbacks={project.feedback} />
                    </div>

                    {/* Service Specs Section */}
                    {(project.service || project.estimate) && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                                <Activity className="w-3 h-3 text-emerald-400" />
                                <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Service Specifications</h3>
                            </div>
                            <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {project.service?.image && (
                                        <div className="relative w-full md:w-40 h-28 rounded-lg bg-zinc-800 overflow-hidden border border-white/5 flex-shrink-0">
                                            <SafeImage
                                                src={project.service.image}
                                                alt={project.service.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 160px"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-3">
                                        {/* Service Features */}
                                        {!!project.service?.features && (
                                            <ServiceFeaturesList
                                                features={(project.service.features as string[]) || []}
                                            />
                                        )}

                                        {/* Estimate Stats */}
                                        {project.estimate && !project.service && (
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                <div className="p-2 bg-black/30 rounded border border-white/5">
                                                    <span className="text-[10px] text-zinc-500 uppercase block">Screens</span>
                                                    <span className="text-sm font-mono text-zinc-300">{(project.estimate.screens as unknown[]).length} Pages</span>
                                                </div>
                                                <div className="p-2 bg-black/30 rounded border border-white/5">
                                                    <span className="text-[10px] text-zinc-500 uppercase block">API Endpoints</span>
                                                    <span className="text-sm font-mono text-zinc-300">{(project.estimate.apis as unknown[]).length} Endpoints</span>
                                                </div>
                                                <div className="p-2 bg-black/30 rounded border border-white/5">
                                                    <span className="text-[10px] text-zinc-500 uppercase block">Total Time</span>
                                                    <span className="text-sm font-mono text-zinc-300">{project.estimate.totalHours} Hours</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.spec && (
                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <h4 className="text-[9px] font-semibold text-zinc-500 uppercase mb-2">Technical Specs</h4>
                                                <TechnicalSpecsViewer spec={project.spec} />
                                            </div>
                                        )}

                                        <div className="pt-4 mt-4 border-t border-white/5">
                                            <FileManager
                                                projectId={project.id}
                                                files={(project.files as ProjectFile[]) || []}
                                                readonly={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                </div>

                {/* Sidebar */}
                <div className="space-y-4 sticky top-6 self-start">

                    <ProjectPreview url={project.previewUrl || null} />

                    {/* Status Card */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                        <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-400" />
                            <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Mission Status</h3>
                        </div>
                        <div className="p-3 space-y-3">
                            <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1.5">Current Status</label>
                                <div className="text-sm text-zinc-200 font-medium px-3 py-2 bg-black/20 rounded border border-white/5">
                                    {statusLabel}
                                </div>
                            </div>
                            <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center gap-1.5 text-zinc-500 mb-0.5">
                                        <Calendar className="w-2.5 h-2.5" />
                                        <span className="text-[9px] uppercase font-medium">Created</span>
                                    </div>
                                    <span className="text-xs text-zinc-300 font-mono">{new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-zinc-500 mb-0.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span className="text-[9px] uppercase font-medium">Updated</span>
                                    </div>
                                    <span className="text-xs text-zinc-300 font-mono">{new Date(project.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

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

                    {/* Team Info Card */}
                    <AssignedTeamCard
                        projectId={project.id}
                        developerId={project.developerId || null}
                        assignedProfile={assignedProfile}
                        repoOwner={project.repoOwner}
                        repoName={project.repoName}
                        repoUrl={project.repoUrl}
                        isEditable={false}
                    />

                </div>

            </div>
        </div>
    );
}
