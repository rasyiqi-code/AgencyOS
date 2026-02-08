"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { acceptMissionApplication } from "@/app/actions/squad";
import { useRouter } from "next/navigation";
import { CheckCircle, Calendar, Clock, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface MissionWithApps {
    id: string;
    title: string;
    createdAt: string | Date;
    applications: {
        id: string;
        squad: {
            name: string;
            role: string;
        };
        createdAt: string | Date;
        status: string;
    }[];
}

interface MissionApplicationListProps {
    missions: MissionWithApps[];
}

export function MissionApplicationList({ missions }: MissionApplicationListProps) {
    const [expandedMission, setExpandedMission] = useState<string | null>(null);

    const router = useRouter();
    const handleAccept = async (applicationId: string) => {
        try {
            const response = await fetch(`/api/squad/applications/${applicationId}/accept`, {
                method: "POST"
            });
            const result = await response.json();

            if (result.success) {
                toast.success("Mission assigned to operative.");
                router.refresh();
            } else {
                toast.error("Failed to assign mission.");
            }
        } catch {
            toast.error("Failed to assign mission.");
        }
    };

    if (missions.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                <p className="text-zinc-500">No pending mission applications.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {missions.map((mission) => (
                <div key={mission.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    {/* Mission Header */}
                    <div className="p-6 flex items-start justify-between cursor-pointer hover:bg-zinc-900/80 transition-colors" onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}>
                        <div className="flex gap-4">
                            <div className="p-3 bg-zinc-800 rounded-lg h-fit">
                                <Clock className="w-6 h-6 text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{mission.title}</h3>
                                <div className="flex items-center gap-3 text-sm text-zinc-400">
                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                        {mission.applications.length} Applicants
                                    </Badge>
                                    <span>Created {formatDistanceToNow(new Date(mission.createdAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-zinc-500">
                            {expandedMission === mission.id ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                    </div>

                    {/* Applicants List (Expanded) */}
                    {expandedMission === mission.id && (
                        <div className="border-t border-zinc-800 bg-black/20 p-6 space-y-4">
                            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Candidate List</h4>
                            {mission.applications.map((app) => (
                                <div key={app.id} className="bg-black border border-zinc-800 rounded-lg p-6 flex flex-col md:flex-row gap-6">
                                    {/* Operative Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h5 className="font-bold text-white text-lg">{app.squad.name}</h5>
                                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                                                {app.squad.role}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-1 text-sm text-zinc-500">
                                            <Calendar className="w-4 h-4" />
                                            Applied {new Date(app.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col justify-center min-w-[150px] border-l border-zinc-800 pl-6 border-dashed">
                                        <div className="space-y-2 w-full">
                                            <form action={() => handleAccept(app.id)}>
                                                <Button className="w-full bg-brand-yellow text-black font-bold hover:bg-brand-yellow/80">
                                                    <CheckCircle className="w-4 h-4 mr-2" /> ACCEPT
                                                </Button>
                                            </form>
                                            <Button variant="outline" className="w-full border-zinc-800 text-zinc-400">
                                                <ExternalLink className="w-4 h-4 mr-2" /> PROFILE
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
