"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { applyForMission } from "@/app/actions/squad";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface MissionApplicationFormProps {
    missionId: string;
    hasApplied?: boolean;
    status?: string;
}

export function MissionApplicationForm({ missionId, hasApplied = false, status }: MissionApplicationFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/squad/missions/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    missionId
                })
            });
            const result = await response.json();

            if (result.success) {
                toast.success("Mission Claimed Successfully!");
                setOpen(false);
                // Optional: Refresh page or redirect
                window.location.reload();
            } else {
                toast.error(result.error || "Failed to claim mission");
            }
        } catch {
            toast.error("Signal lost. Please retry.");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'accepted') {
        return (
            <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl text-center w-full">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-white font-bold mb-1">Mission Access Granted</h3>
                <p className="text-zinc-400 text-sm mb-4">
                    Your application has been accepted. Proceed to active protocol.
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-500 text-black font-bold">
                    <a href="/squad/active">View Active Mission</a>
                </Button>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center w-full">
                <h3 className="text-white font-bold mb-1">Application Declined</h3>
                <p className="text-zinc-400 text-sm">
                    Verified operatives with different clearance were selected for this mission.
                </p>
            </div>
        );
    }

    if (hasApplied || status === 'pending') {
        return (
            <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-6 rounded-xl text-center w-full">
                <CheckCircle2 className="w-12 h-12 text-brand-yellow mx-auto mb-2" />
                <h3 className="text-white font-bold mb-1">Application Submitted</h3>
                <p className="text-zinc-400 text-sm">
                    Status: Pending Review
                </p>
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-brand-yellow text-black font-bold text-lg hover:bg-brand-yellow/90 flex items-center gap-2 h-12 rounded-xl transition-all shadow-lg shadow-brand-yellow/20">
                    <Send className="w-5 h-5" /> Claim Task
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border border-zinc-800 text-white sm:max-w-md rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl tracking-tight font-bold">
                        Confirm Mission Claim
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Are you sure you want to claim this task? By claiming, you agree to the mission parameters and deadline.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <p className="text-yellow-500 text-sm font-medium">
                            Warning: This action is binding. Failure to deliver may affect your reputation score.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold rounded-lg">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Confirm & Claim
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
