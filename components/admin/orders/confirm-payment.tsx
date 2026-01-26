"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { confirmOrder } from "@/app/actions/admin";
import { useTransition } from "react";
import { toast } from "sonner";

export function ConfirmPaymentButton({ estimateId }: { estimateId: string }) {
    const [isPending, startTransition] = useTransition();

    function onClick() {
        if (!confirm("Confirm this payment has been received? This will activate the project.")) return;

        startTransition(async () => {
            try {
                await confirmOrder(estimateId);
                toast.success("Payment confirmed. Project activated.");
            } catch (error) {
                toast.error("Failed to confirm payment.");
                console.error(error);
            }
        });
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={isPending}
            className="h-8 w-8 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10"
            title="Mark as Paid & Activate Project"
        >
            <CheckCircle2 className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        </Button>
    );
}
