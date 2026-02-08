
"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface InvitationActionProps {
    missionId: string;
}

export function InvitationAction({ missionId }: InvitationActionProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: 'accept' | 'reject') => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/squad/missions/${missionId}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) throw new Error("Failed to respond to invitation");

            toast.success(action === 'accept' ? "Invitation accepted!" : "Invitation declined.");
            router.refresh();

            if (action === 'reject') {
                router.push('/squad'); // Redirect to dashboard heavily suggests 'leave'
            }
        } catch (error) {
            toast.error("Something went wrong.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
            <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-500">Invitation Pending</h3>
                <p className="text-xs text-zinc-400">You have been invited to join this mission. Please respond to proceed.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={() => handleAction('reject')}
                    disabled={isLoading}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                </Button>
                <Button
                    size="sm"
                    className="bg-amber-500 text-black hover:bg-amber-400"
                    onClick={() => handleAction('accept')}
                    disabled={isLoading}
                >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept Mission
                </Button>
            </div>
        </div>
    );
}
