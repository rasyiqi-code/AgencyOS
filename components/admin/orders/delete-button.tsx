"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteOrderButton({ id, type = "service" }: { id: string, type?: "service" | "digital" }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function onClick() {
        if (!confirm("Are you sure you want to PERMANENTLY delete this transaction? This action cannot be undone.")) return;

        startTransition(async () => {
            try {
                if (type === "digital") {
                    // We'll import the action dynamically or pass it as a prop?
                    // Better to use fetch for consistency if possible, or just a server action.
                    const { deleteDigitalOrder } = await import("@/app/actions/digital-orders");
                    const res = await deleteDigitalOrder(id);
                    if (!res.success) throw new Error(res.error || "Failed");
                } else {
                    const res = await fetch(`/api/estimates/${id}`, {
                        method: "DELETE"
                    });
                    if (!res.ok) throw new Error("Failed");
                }
                
                toast.success("Transaction deleted permanently.");
                router.refresh();
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
