"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// import { updateProjectStatus } from "@/app/actions/admin";
import { useTransition } from "react";
import { toast } from "sonner";

export default function StatusSelector({
    projectId,
    initialStatus,
}: {
    projectId: string;
    initialStatus: string;
}) {
    const [isPending, startTransition] = useTransition();

    function onValueChange(value: string) {
        startTransition(async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: value }),
                });
                if (!res.ok) throw new Error("Failed");
                toast.success("Status updated");
            } catch (error) {
                console.error("Failed to update status", error);
                toast.error("Failed to update status");
            }
        });
    }

    return (
        <div className="flex items-center gap-2 w-full">
            <Select
                defaultValue={initialStatus}
                onValueChange={onValueChange}
                disabled={isPending}
            >
                <SelectTrigger className="w-full bg-black/20 border-white/10 text-zinc-200">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="queue">Queue</SelectItem>
                    <SelectItem value="dev">In Development</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                </SelectContent>
            </Select>
            {isPending && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
        </div>
    );
}
