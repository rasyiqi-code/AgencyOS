"use client";

import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Assuming sonner is used
import { useRouter } from "next/navigation";

export function UnpaidButton({ estimateId }: { estimateId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUnpaid = async () => {
        if (!confirm("Are you sure you want to mark this as UNPAID? This will revert the status.")) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/checkout/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estimateId,
                    status: "payment_pending"
                })
            });

            if (!res.ok) throw new Error("Failed to update status");

            toast.success("Marked as Unpaid");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to mark as unpaid");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
            onClick={handleUnpaid}
            disabled={isLoading}
            title="Mark as Unpaid"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <XCircle className="h-4 w-4" />
            )}
        </Button>
    );
}
