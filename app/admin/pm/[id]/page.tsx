
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { User, Github, FileText, Activity, MessageSquare, Clock, Calendar, Terminal } from "lucide-react";
import { isAdmin } from "@/lib/auth-helpers";
import StatusSelector from "./status-selector"; // Same folder import
import { TechnicalAssetManager } from "./asset-manager";
import { DeveloperSelector } from "./developer-selector";
import { ServiceFeaturesList } from "@/components/dashboard/shared/service-features";
import { ProjectHeader } from "@/components/dashboard/missions/header";
import { DailyLogFeed } from "@/components/dashboard/missions/daily-log-feed";
import { WorkbenchStatus } from "@/components/dashboard/missions/workbench-status";
import { RepoActivity } from "@/components/dashboard/missions/repo-activity";
import { Badge } from "@/components/ui/badge";
import { type ExtendedProject, type ProjectFile } from "@/lib/types";
import { PreviewUploader } from "./preview-uploader";
import { FileManager } from "./file-manager";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
    if (!await isAdmin()) redirect('/dashboard');
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            service: true,
            briefs: true,
            feedback: true,
            dailyLogs: {
                orderBy: { createdAt: 'desc' }
            }
        }
    }) as unknown as ExtendedProject;

    if (!project) notFound();

    return (
        <div className="w-full py-4 pb-12">
            <ProjectHeader project={project}>
                <div className="pl-2 border-l border-white/10 ml-1">
                    <TechnicalAssetManager project={project} />
                </div>
            </ProjectHeader>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Left Column (Content) */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Overview Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                            <FileText className="w-3 h-3 text-blue-400" />
                            <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Project Overview</h3>
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
                            {project.spec && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <h4 className="text-[9px] font-semibold text-zinc-500 uppercase mb-2">Technical Specs</h4>
                                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 font-mono text-xs text-zinc-400">
                                        {project.spec}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <DailyLogFeed projectId={project.id} initialLogs={project.dailyLogs} isAdmin={true} />
                    </div>

                    {/* Service Specs Section */}
                    {/* Service Specs Section */}
                    {project.service && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                                <Activity className="w-3 h-3 text-emerald-400" />
                                <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Service Specifications</h3>
                            </div>
                            <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {project.service.image && (
                                        <div className="w-full md:w-40 h-28 rounded-lg bg-zinc-800 overflow-hidden border border-white/5 flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={project.service.image} alt={project.service.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h4 className="text-base font-bold text-white">{project.service.title}</h4>
                                            <div className="text-zinc-400 text-xs mt-1 prose prose-invert prose-sm max-w-none line-clamp-2" dangerouslySetInnerHTML={{ __html: project.service.description }} />
                                        </div>

                                        {!!project.service.features && (
                                            <ServiceFeaturesList
                                                features={(project.service.features as string[]) || []}
                                                variant="admin"
                                            />
                                        )}

                                        <div className="pt-4 mt-4 border-t border-white/5">
                                            <FileManager
                                                projectId={project.id}
                                                files={(project.files as ProjectFile[]) || []}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Briefs Section */}
                    {project.briefs.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                                <MessageSquare className="w-3 h-3 text-violet-400" />
                                <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Generated Briefs</h3>
                            </div>
                            <div className="grid gap-3">
                                {project.briefs.map((brief, i: number) => (
                                    <div key={brief.id} className="group rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden hover:border-white/10 transition-colors">
                                        <div className="bg-white/5 px-3 py-1.5 flex items-center justify-between border-b border-white/5">
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Brief Version {i + 1}</span>
                                            <span className="text-[9px] text-zinc-600 font-mono">{new Date(brief.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="p-3 text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono bg-black/20">
                                            {brief.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Metadata) */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Project Preview Widget */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <PreviewUploader
                            projectId={project.id}
                            currentPreviewUrl={project.previewUrl || null}
                        />
                    </div>

                    {/* Control Card */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                        <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-400" />
                            <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Status & Control</h3>
                        </div>
                        <div className="p-3 space-y-3">
                            <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1.5">Current Status</label>
                                <StatusSelector projectId={project.id} initialStatus={project.status} />
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
                        <div className="flex items-center gap-2 mb-4 text-zinc-400">
                            <Terminal className="w-3.5 h-3.5" />
                            <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider">Project Workbench</h2>
                        </div>

                        {(project.repoOwner && project.repoName) || project.deployUrl ? (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-zinc-500 uppercase tracking-wider font-medium">System Status</span>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0">Active Uplink</Badge>
                                    </div>
                                    <WorkbenchStatus projectId={project.id} deployUrl={project.deployUrl} />
                                </div>
                                <div className="border-t border-white/5 pt-3">
                                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Live Repository Activity</p>
                                    {project.repoOwner && project.repoName && (
                                        <RepoActivity owner={project.repoOwner} repo={project.repoName} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-zinc-950/30 rounded-lg border border-white/5 border-dashed">
                                <Terminal className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                                <p className="text-xs text-zinc-500">No technical assets linked yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Team Info Card */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                        <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                            <User className="w-3 h-3 text-blue-400" />
                            <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Team</h3>
                        </div>
                        <div className="p-3 space-y-3">
                            <div>
                                <DeveloperSelector projectId={project.id} initialDeveloperId={project.developerId || null} />
                            </div>

                            <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Repository</label>
                                {project.repoOwner && project.repoName ? (
                                    <a
                                        href={`https://github.com/${project.repoOwner}/${project.repoName}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center group"
                                    >
                                        <div className="flex items-center gap-2 w-full p-1.5 rounded bg-black/20 border border-white/5 group-hover:border-white/20 transition-colors">
                                            <Github className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                                            <span className="text-xs text-zinc-300 group-hover:text-white truncate font-mono">
                                                {project.repoOwner}/{project.repoName}
                                            </span>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 italic p-1.5 rounded border border-dashed border-white/10">
                                        <Github className="w-3.5 h-3.5 opacity-50" />
                                        <span>Not linked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
