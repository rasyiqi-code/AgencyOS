"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2, Check } from "lucide-react";

interface DeployButtonProps {
    projectId: string;
    deployUrl?: string | null;
}

export function DeployButton({ projectId, deployUrl }: DeployButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!deployUrl) return null;

    const handleDeploy = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/deploy', {
                method: 'POST',
                body: JSON.stringify({ projectId }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error("Deploy failed");

            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000); // Reset after 3s
        } catch (error) {
            console.error(error);
            alert("Failed to trigger deployment. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDeploy}
            disabled={isLoading || isSuccess}
            className={`gap-2 transition-all ${isSuccess ? 'border-green-500 text-green-500 bg-green-500/10' : ''}`}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSuccess ? (
                <Check className="w-4 h-4" />
            ) : (
                <Rocket className="w-4 h-4" />
            )}
            {isLoading ? "Triggering..." : isSuccess ? "Deployed!" : "Trigger Deploy"}
        </Button>
    );
}
