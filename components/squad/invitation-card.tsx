"use client";

import { useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


interface InvitationCardProps {
    applicationId: string;
    missionTitle: string;
}

export function InvitationCard({ applicationId, missionTitle }: InvitationCardProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleResponse = (accept: boolean) => {
        startTransition(async () => {
            try {
                const res = await fetch("/api/squad/invitations/respond", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ applicationId, accept }),
                });

                if (!res.ok) throw new Error("Failed to respond");

                toast.success(accept ? "Invitation Accepted!" : "Invitation Declined");
                router.refresh();
            } catch (error) {
                toast.error("An error occurred");
                console.error(error);
            }
        });
    };

    return (
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1 block">Pending Invitation</span>
                <h3 className="text-sm font-semibold text-white">{missionTitle}</h3>
                <p className="text-xs text-zinc-500 mt-1">You have been invited to join this mission.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                    onClick={() => handleResponse(false)}
                    disabled={isPending}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-zinc-400 text-xs transition-colors disabled:opacity-50"
                >
                    <X className="w-3.5 h-3.5" />
                    Decline
                </button>
                <button
                    onClick={() => handleResponse(true)}
                    disabled={isPending}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Accept
                </button>
            </div>
        </div>
    );
}
