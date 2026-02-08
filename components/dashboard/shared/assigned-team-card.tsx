
"use client";

import { User, Github, UserCheck, XCircle } from "lucide-react";
import { DeveloperSelector } from "./developer-selector";
import { SquadProfile } from "@prisma/client";
// import Image from "next/image";

interface AssignedTeamCardProps {
    projectId: string;
    developerId: string | null;
    assignedProfile?: SquadProfile | null;
    repoOwner: string | null;
    repoName: string | null;
    repoUrl: string | null;
    isEditable?: boolean;
}

export function AssignedTeamCard({
    projectId,
    developerId,
    assignedProfile, // Keep for backward compat if needed, but we'll use team
    team = [], // New prop for multiple devs
    repoOwner,
    repoName,
    repoUrl,
    isEditable = false,
}: AssignedTeamCardProps & { team?: (SquadProfile & { applicationStatus?: string })[] }) {
    // Combine single profile if exists and team is empty (migration path)
    const effectiveTeam = (team.length > 0 ? team : (assignedProfile ? [assignedProfile] : [])) as (SquadProfile & { applicationStatus?: string })[];

    return (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                <User className="w-3 h-3 text-blue-400" />
                <h3 className="text-[10px] font-semibold text-white uppercase tracking-wider">Assigned Team</h3>
            </div>
            <div className="p-3 space-y-3">
                {/* Developer Section */}
                <div>
                    {isEditable ? (
                        <div className="space-y-3">
                            <DeveloperSelector projectId={projectId} initialDeveloperId={developerId} />

                            {/* Show full team list in admin/editable mode too */}
                            {effectiveTeam.length > 0 && (
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase block">Current Team Members</label>
                                    <div className="space-y-2">
                                        {effectiveTeam.map((profile) => (
                                            <div key={profile.id} className="flex items-center gap-2 p-2 rounded bg-black/20 border border-white/5 group relative">
                                                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                                    <span className="text-xs font-bold text-zinc-400">{profile.name.charAt(0)}</span>
                                                </div>
                                                <div className="overflow-hidden flex-1">
                                                    <p className="text-xs text-white font-medium truncate">{profile.name}</p>
                                                    <p className="text-[10px] text-zinc-500 truncate">{profile.role}</p>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Remove this member from the mission?")) {
                                                            try {
                                                                await fetch(`/api/projects/${projectId}/team/${profile.id}`, { method: 'DELETE' });
                                                                window.location.reload();
                                                            } catch (e) {
                                                                console.error("Failed to remove member", e);
                                                            }
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-500 transition-all"
                                                    title="Remove from team"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1 mb-2">
                                <UserCheck className="w-2.5 h-2.5" /> Assigned Developers
                            </label>

                            {effectiveTeam.length > 0 ? (
                                <div className="space-y-2">
                                    {effectiveTeam.map((profile) => (
                                        <div key={profile.id} className="flex items-center gap-2 p-2 rounded bg-black/20 border border-white/5">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                                <span className="text-xs font-bold text-zinc-400">{profile.name.charAt(0)}</span>
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <p className="text-xs text-white font-medium truncate">{profile.name}</p>
                                                <p className="text-[10px] text-zinc-500 truncate">{profile.role}</p>
                                            </div>
                                            {profile.applicationStatus === 'invited' && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    Invited
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-2 rounded border border-dashed border-white/10 bg-white/5">
                                    <User className="w-4 h-4 text-zinc-600" />
                                    <span className="text-xs text-zinc-500 italic">No developers assigned</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Repository Section */}
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Repository</label>
                    {repoOwner && repoName ? (
                        <a
                            href={repoUrl || `https://github.com/${repoOwner}/${repoName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center group"
                        >
                            <div className="flex items-center gap-2 w-full p-1.5 rounded bg-black/20 border border-white/5 group-hover:border-white/20 transition-colors">
                                <Github className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                                <span className="text-xs text-zinc-300 group-hover:text-white truncate font-mono">
                                    {repoOwner}/{repoName}
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
        </div >
    );
}
