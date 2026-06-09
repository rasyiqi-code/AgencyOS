"use client";
import { useRouter } from "@/lib/router/hooks";


import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";
import { toast } from "sonner";
import { confirmPaymentFn } from "@/src/server/estimates";

export function ConfirmPaymentButton({ estimateId, paymentType }: { estimateId: string, paymentType?: string | null }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const isDP = paymentType === 'DP';
    const actionLabel = isDP ? "Confirm DP (50%)" : "Confirm Full Payment";

    function onClick() {
        if (!confirm(`Are you sure you want to ${actionLabel.toLowerCase()}? This will activate the project.`)) return;

        startTransition(async () => {
            try {
                const result = await confirmPaymentFn({ data: estimateId });
                if (result.error) throw new Error("Failed");
                toast.success(`Payment confirmed. Project status updated.`);
                router.invalidate();
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
            title={actionLabel}
        >
            <CheckCircle2 className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        </Button>
    );
}
