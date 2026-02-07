
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
import { useRouter } from "next/navigation";

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
                const res = await fetch("/api/admin/squad/users"); // Fetch from Squad APIs
                if (res.ok) {
                    const data = await res.json();
                    setDevelopers(data);
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
                const res = await fetch(`/api/projects/${projectId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ developerId: devId }),
                });
                if (!res.ok) throw new Error("Failed");
                toast.success("Developer assigned successfully");
                router.refresh();
            } catch (error) {
                console.error("Failed to assign developer", error);
                toast.error("Failed to assign developer");
            }
        });
    }

    return (
        <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                <UserCheck className="w-2.5 h-2.5" /> Assigned Developer
            </label>
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
