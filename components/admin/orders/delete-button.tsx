"use client";
import { useRouter } from "@/lib/router/hooks";


import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { deleteDigitalOrderFn, deleteQuoteFn, deleteOrderFn } from "@/src/server/finance";

export function DeleteOrderButton({ id, type = "service" }: { id: string, type?: "service" | "digital" }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function onClick() {
        if (!confirm("Are you sure you want to PERMANENTLY delete this transaction? This action cannot be undone.")) return;

        startTransition(async () => {
            try {
                if (type === "digital") {
                    await deleteDigitalOrderFn({ data: id });
                } else {
                    const isOrderId = id.startsWith('ORDER-');
                    if (isOrderId) {
                        await deleteOrderFn({ data: id });
                    } else {
                        await deleteQuoteFn({ data: { estimateId: id } });
                    }
                }
                
                toast.success("Transaction deleted permanently.");
                router.invalidate();
            } catch (error) {
                toast.error("Failed to delete transaction.");
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
            className="h-9 w-9 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 border border-white/5"
            title="Delete Transaction"
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </Button>
    );
}
