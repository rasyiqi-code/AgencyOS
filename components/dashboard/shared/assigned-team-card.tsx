
import { User, Github, UserCheck } from "lucide-react";
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
    assignedProfile,
    repoOwner,
    repoName,
    repoUrl,
    isEditable = false,
}: AssignedTeamCardProps) {
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
                        <DeveloperSelector projectId={projectId} initialDeveloperId={developerId} />
                    ) : (
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                                <UserCheck className="w-2.5 h-2.5" /> Assigned Developer
                            </label>
                            {assignedProfile ? (
                                <div className="flex items-center gap-2 p-2 rounded bg-black/20 border border-white/5">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                        <span className="text-xs font-bold text-zinc-400">{assignedProfile.name.charAt(0)}</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-white font-medium truncate">{assignedProfile.name}</p>
                                        <p className="text-[10px] text-zinc-500 truncate">{assignedProfile.role}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-2 rounded border border-dashed border-white/10 bg-white/5">
                                    <User className="w-4 h-4 text-zinc-600" />
                                    <span className="text-xs text-zinc-500 italic">No developer assigned</span>
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
        </div>
    );
}
