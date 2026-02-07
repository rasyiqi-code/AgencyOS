"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface ProfileActionsProps {
    profileId: string;
}

export function ProfileActions({ profileId }: ProfileActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: "approve" | "reject") => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/squad/profile/${profileId}/${action}`, {
                method: "POST"
            });
            const result = await response.json();

            if (result.success) {
                toast.success(`Profile ${action}d successfully`);
                router.refresh();
            } else {
                toast.error(`Failed to ${action} profile`);
            }
        } catch {
            toast.error(`Failed to ${action} profile`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex gap-2 w-full">
            <Button
                onClick={() => handleAction("approve")}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-8 text-xs font-bold"
            >
                <CheckCircle className="w-3 h-3 mr-2" /> APPROVE
            </Button>
            <Button
                onClick={() => handleAction("reject")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-red-900/30 text-red-500 hover:bg-red-900/20 hover:text-red-400 h-8 text-xs"
            >
                <XCircle className="w-3 h-3 mr-2" /> REJECT
            </Button>
        </div>
    );
}
