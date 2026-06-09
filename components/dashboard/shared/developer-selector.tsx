
"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserCheck, Loader2 } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { updateProjectFn } from "@/src/server/pm";
import { getSquadDevelopersFn } from "@/src/server/affiliates";

interface Developer {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
}

export function DeveloperSelector({
    projectId,
    initialDeveloperId,
}: {
    projectId: string;
    initialDeveloperId: string | null;
}) {
    const [isPending, startTransition] = useTransition();
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchDevelopers() {
            try {
                const result = await getSquadDevelopersFn();
                if (result.success) {
                    setDevelopers(result.data as Developer[]);
                }
            } catch (error) {
                console.error("Failed to fetch developers:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDevelopers();
    }, []);

    function onValueChange(value: string) {
        const devId = value === "none" ? null : value;
        startTransition(async () => {
            try {
                await updateProjectFn({ data: { projectId, body: { developerId: devId } } });
                toast.success("Developer assigned successfully");
                router.invalidate();
            } catch (error) {
                console.error("Failed to assign developer", error);
                toast.error("Failed to assign developer");
            }
        });
    }

    return (
        <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                <UserCheck className="w-2.5 h-2.5" /> Assigned Developer
            </span>
            <Select
                defaultValue={initialDeveloperId || "none"}
                onValueChange={onValueChange}
                disabled={isPending || loading}
            >
                <SelectTrigger className="w-full bg-black/20 border-white/5 text-zinc-200 h-8 text-xs">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Loading squad...</span>
                        </div>
                    ) : (
                        <SelectValue placeholder="Select Developer" />
                    )}
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="none" className="text-zinc-500">Unassigned</SelectItem>
                    {developers.map((dev) => (
                        <SelectItem key={dev.id} value={dev.id}>
                            {dev.displayName || dev.primaryEmail || dev.id}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {isPending && <p className="text-[8px] text-blue-400 animate-pulse text-right">Updating assignment...</p>}
        </div>
    );
}
