"use client";
import { useRouter } from "@/lib/router/hooks";


import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/hooks";
import { useNavigate } from "@tanstack/react-router";
import { cancelEstimateFn } from "@/src/server/estimates";

export function CancelOrderButton({ estimateId }: { estimateId: string }) {
    const [isPending, startTransition] = useTransition();
    const t = useTranslations("Admin.Finance");
    const router = useRouter();

    function onClick() {
        if (!confirm(t("confirmCancel"))) return;

        startTransition(async () => {
            try {
                const result = await cancelEstimateFn({ data: estimateId });
                if (result.error) throw new Error("Failed");
                toast.success(t("successCancel"));
                router.invalidate();
            } catch (error) {
                toast.error("Failed to cancel transaction.");
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
            className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
            title="Cancel Transaction"
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </Button>
    );
}
