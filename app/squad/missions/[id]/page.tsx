import { prisma } from "@/lib/config/db";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft, FileText, Activity, Calendar, Clock, Github, Terminal, MessageSquare, Shield } from "lucide-react";
import { stackServerApp } from "@/lib/config/stack";
import { ServiceFeaturesList } from "@/components/dashboard/shared/service-features";
import { TechnicalSpecsViewer } from "@/components/dashboard/shared/technical-specs-viewer";
import { FileManager } from "@/app/admin/pm/[id]/file-manager";
import { SafeImage } from "@/components/ui/safe-image";
import { ProjectFile } from "@/lib/shared/types";
import { ProjectPreview } from "@/components/dashboard/missions/project-preview";
import { WorkbenchStatus } from "@/components/dashboard/missions/workbench-status";
import { RepoActivity } from "@/components/dashboard/missions/repo-activity";
import { DailyLogFeed } from "@/components/dashboard/missions/daily-log-feed";
import { FeedbackBoard } from "@/components/feedback/board";
import { AssignedTeamCard } from "@/components/dashboard/shared/assigned-team-card";
import { InvitationAction } from "@/components/dashboard/missions/invitation-action";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function MissionDetailPage({ params }: PageProps) {
    const { id } = await params;
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const squadProfile = await prisma.squadProfile.findUnique({
        where: { userId: user.id }
    });

    if (!squadProfile) {
        redirect("/squad/onboarding");
    }

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            briefs: true,
            service: true,
            estimate: true,
            dailyLogs: {
                orderBy: { createdAt: 'desc' }
            },
            feedback: {
                include: { comments: { orderBy: { createdAt: 'asc' } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!project) notFound();

    // Check if user already applied
    const existingApplication = await prisma.missionApplication.findUnique({
        where: {
            missionId_squadId: {
                missionId: project.id,
                squadId: squadProfile.id
            }
        }
    });


    const canPost = (existingApplication?.status === 'accepted') || (project.developerId === squadProfile.id);

    // ... existing imports ...

    // Inside component ...
    // Fetch Team (Accepted Applications)
    const teamApplications = await prisma.missionApplication.findMany({
        where: {
            missionId: project.id,
            status: { in: ['accepted', 'invited'] } // Fetch both to determine status
        },
        include: {
            squad: true
        }
    });

    // Separate active team from invited
    const activeTeam = teamApplications.filter(app => app.status === 'accepted').map(app => app.squad);
    const invitedTeam = teamApplications.filter(app => app.status === 'invited').map(app => app.squad);

    // Full team for card display (with status injected)
    const team = teamApplications.map(app => ({
        ...app.squad,
        applicationStatus: app.status
    }));

    const isInvited = existingApplication?.status === 'invited';

    return (
        <div className="flex flex-col gap-8 pb-10 w-full">
            {/* Nav */}
            <Link href="/squad" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium">
                <ChevronLeft className="w-4 h-4" /> Back to Missions
            </Link>

            {/* Invitation Banner */}
            {isInvited && (
                <InvitationAction missionId={project.id} />
            )}

            {/* Header */}
            <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="px-2 py-0.5 bg-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded text-[10px] font-medium border border-zinc-700">
                        {project.id.slice(-8).toUpperCase()}
                    </Badge>
                    <div className="flex gap-2">
                        {project.repoUrl && (
                            <Link href={project.repoUrl} target="_blank">
                                <Badge variant="outline" className="px-3 py-1 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer transition-colors">
                                    <Github className="w-3 h-3 mr-1.5" /> Repository
                                </Badge>
                            </Link>
                        )}
                        {activeTeam.length > 0 ? (
                            <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                                ACTIVE MISSION
                            </span>
                        ) : invitedTeam.length > 0 ? (
                            <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 animate-pulse">
                                AWAITING ACCEPTANCE
                            </span>
                        ) : (
                            <span className="text-xs text-brand-yellow font-bold bg-brand-yellow/10 px-2 py-1 rounded border border-brand-yellow/20">
                                PENDING ASSIGNMENT
                            </span>
                        )}
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">{project.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Content (Left Column) */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Rich Description (Mission Details) */}
                    <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <h3 className="text-sm font-semibold text-white">Mission Overview</h3>
                        </div>

                        {project.description && !project.description.startsWith("Purchase of") && (
                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{project.description}</p>
                        )}

                        {project.service?.description && (
                            <div className="text-zinc-300 text-sm leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: project.service.description }} />
                        )}

                        {!project.description && !project.service?.description && (
                            <p className="text-zinc-500 italic">No detailed description provided.</p>
                        )}
                    </div>

                    {/* Mission Updates (Daily Logs) */}
                    <div className="h-[500px]">
                        <DailyLogFeed projectId={project.id} initialLogs={project.dailyLogs} canPost={canPost} />
                    </div>

                    {/* Communications Channel (Feedback) */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                            <h3 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">Communications Channel</h3>
                        </div>
                        <FeedbackBoard projectId={project.id} feedbacks={project.feedback} />
                    </div>

                    {/* Mission Intelligence / Specifications */}
                    {(project.service || project.estimate) && (
                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4">
                            {/* Header - Hidden to match clean look or kept small? User said 'samakan dengan ini' which shows a card. I'll keep a small header or just the content. The reference has a dark card background. */}
                            <div className="flex items-center gap-2 mb-4 text-brand-yellow">
                                <Activity className="w-3.5 h-3.5" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none">Mission Intelligence</h3>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Top Row: Image + Features */}
                                <div className="flex flex-col md:flex-row gap-5">
                                    {project.service?.image && (
                                        <div className="relative w-full md:w-48 h-32 rounded-lg bg-zinc-800 overflow-hidden border border-white/5 flex-shrink-0 shadow-sm">
                                            <SafeImage
                                                src={project.service.image}
                                                alt={project.service.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 192px"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-3">
                                        {/* Service Features */}
                                        {!!project.service?.features && (
                                            <div className="space-y-1.5">
                                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Service Specifications</h4>
                                                <ServiceFeaturesList
                                                    features={(project.service.features as string[]) || []}
                                                />
                                            </div>
                                        )}

                                        {/* Estimate Stats (if no service) */}
                                        {project.estimate && !project.service && (
                                            <div className="space-y-1.5">
                                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Estimate Data</h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="p-2 bg-black/30 rounded border border-white/5">
                                                        <span className="text-[9px] text-zinc-500 uppercase block">Screens</span>
                                                        <span className="text-xs font-mono text-zinc-300">{(project.estimate.screens as unknown[]).length}</span>
                                                    </div>
                                                    <div className="p-2 bg-black/30 rounded border border-white/5">
                                                        <span className="text-[9px] text-zinc-500 uppercase block">Endpoints</span>
                                                        <span className="text-xs font-mono text-zinc-300">{(project.estimate.apis as unknown[]).length}</span>
                                                    </div>
                                                    <div className="p-2 bg-black/30 rounded border border-white/5">
                                                        <span className="text-[9px] text-zinc-500 uppercase block">Hours</span>
                                                        <span className="text-xs font-mono text-brand-yellow">{project.estimate.totalHours}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Technical Specs - Compact View */}
                                        {project.spec && (
                                            <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                                                <TechnicalSpecsViewer spec={project.spec} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                {((project.files as unknown as ProjectFile[]) || []).length > 0 && (
                                    <div className="w-full h-px bg-white/5" />
                                )}

                                {/* Attachments Section - Matching Reference */}
                                {((project.files as unknown as ProjectFile[]) || []).length > 0 && (
                                    <div className="space-y-3">
                                        <div className="bg-zinc-950/30 rounded-lg border border-white/5 p-1">
                                            <FileManager
                                                projectId={project.id}
                                                files={(project.files as unknown as ProjectFile[]) || []}
                                                readonly={true}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                </div>

                {/* Sidebar (Right Column) */}
                <div className="space-y-4">
                    {/* Effort Card */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
                        <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Estimated Effort</span>
                        <div className="text-3xl font-bold text-white tracking-tight text-white">
                            {project.estimate?.totalHours ? `${project.estimate.totalHours}h` : "TBD"}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                            {project.estimate?.totalHours ? "Resource Allocation" : "Pending Estimation"}
                        </div>
                    </div>

                    {/* Assignment Status Card */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3">
                        <Shield className="w-8 h-8 text-zinc-700 mb-1" />
                        <div>
                            <h3 className="text-sm font-bold text-white">Protected Mission</h3>
                            <p className="text-zinc-500 text-[10px] mt-0.5">
                                Assignment is restricted to authorized personnel only.
                            </p>
                        </div>
                    </div>

                    {/* Sticky Wrapper for Tools */}
                    <div className="space-y-4 sticky top-24">
                        {/* Project Preview used in Admin/Client */}
                        <ProjectPreview url={project.previewUrl || null} />

                        {/* Workbench Widget */}
                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                            <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                <Terminal className="w-3.5 h-3.5" />
                                <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">Mission Workbench</h2>
                            </div>

                            {(project.repoOwner && project.repoName) || project.deployUrl ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-zinc-500 uppercase tracking-wider font-medium">Status</span>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0">Active Uplink</Badge>
                                        </div>
                                        <WorkbenchStatus projectId={project.id} deployUrl={project.deployUrl} />
                                    </div>
                                    <div className="border-t border-zinc-800 pt-4">
                                        <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Repository Activity</p>
                                        {project.repoOwner && project.repoName && (
                                            <RepoActivity owner={project.repoOwner} repo={project.repoName} />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-zinc-950/30 rounded-lg border border-zinc-800 border-dashed">
                                    <Terminal className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                                    <p className="text-xs text-zinc-500">Repository not linked.</p>
                                </div>
                            )}
                        </div>

                        {/* Metadata Card */}
                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                            <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-400" />
                                <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Mission Metadata</h3>
                            </div>
                            <div className="p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[9px] uppercase font-medium">Created</span>
                                        </div>
                                        <span className="text-xs text-zinc-300 font-mono">{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[9px] uppercase font-medium">Updated</span>
                                        </div>
                                        <span className="text-xs text-zinc-300 font-mono">{new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Team Info Card */}
                        <AssignedTeamCard
                            projectId={project.id}
                            developerId={project.developerId}
                            team={team}
                            repoOwner={project.repoOwner}
                            repoName={project.repoName}
                            repoUrl={project.repoUrl}
                            isEditable={false}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}
