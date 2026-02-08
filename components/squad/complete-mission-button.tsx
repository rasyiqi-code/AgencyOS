"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface CompleteMissionButtonProps {
    missionId: string;
}

export function CompleteMissionButton({ missionId }: CompleteMissionButtonProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/squad/missions/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ missionId })
            });
            const result = await response.json();

            if (result.success) {
                toast.success("Mission submitted and completed!");
                setOpen(false);
                window.location.reload();
            } else {
                toast.error(result.error || "Failed to complete mission");
            }
        } catch {
            toast.error("Signal lost. Retry.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Submit for Review
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Submit Mission for Review?</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        This will mark the protocol as executed. Ensure all merge requests are finalized.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Confirm Execution
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
