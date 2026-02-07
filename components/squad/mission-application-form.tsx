"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    const [coverLetter, setCoverLetter] = useState("");
    const [proposedRate, setProposedRate] = useState("");

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/squad/missions/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    missionId,
                    coverLetter,
                    proposedRate: proposedRate ? parseFloat(proposedRate) : undefined
                })
            });
            const result = await response.json();

            if (result.success) {
                toast.success("Application submitted successfully!");
                setOpen(false);
            } else {
                toast.error(result.error || "Failed to submit application");
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
                    <Send className="w-5 h-5" /> Start Application
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border border-zinc-800 text-white sm:max-w-md rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl tracking-tight font-bold">
                        Apply for Mission
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Provide intel on why you are the optimal operative for this mission.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-300 font-medium">Cover Letter / Pitch</Label>
                        <Textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="I have executed similar protocols in..."
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-brand-yellow focus-visible:ring-offset-0 h-32 rounded-lg text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-300 font-medium">Proposed Rate (Optional)</Label>
                        <Input
                            type="number"
                            value={proposedRate}
                            onChange={(e) => setProposedRate(e.target.value)}
                            placeholder="Leave empty for standard bounty"
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-brand-yellow focus-visible:ring-offset-0 rounded-lg text-white"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !coverLetter} className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold rounded-lg">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Submit Application
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
