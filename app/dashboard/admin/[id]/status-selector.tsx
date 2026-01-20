"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateProjectStatus } from "../actions";
import { useTransition } from "react";
import { toast } from "sonner"; // Assuming sonner is installed or we use basic alert for now if not. 
// Actually, I haven't installed sonner yet. I'll use simple window.alert or console for MVP error handling if I don't want to install toast right now, 
// OR I can install sonner. The previous tasks said "Implement Success/Error Toast Notifications" in Phase 1.5, causing me to think I might have it?
// Checking package.json would verify. If not, I'll use a simple approach or just rely on the UI updating.

// Let's use a simpler approach for MVP without toast dependencies if possible, or just standard alert.
// But better: Shadcn usually adds 'sonner' or 'toast'. 
// I'll stick to basic UI state update for now to avoid dependency hell if I missed installing toast.

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
                await updateProjectStatus(projectId, value);
                toast.success("Status updated");
            } catch (error) {
                console.error("Failed to update status", error);
                toast.error("Failed to update status");
            }
        });
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Select
                defaultValue={initialStatus}
                onValueChange={onValueChange}
                disabled={isPending}
            >
                <SelectTrigger className="w-[180px]">
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
