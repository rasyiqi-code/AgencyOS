"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        if (!confirm("Are you sure you want to delete this service?")) return;

        startTransition(async () => {
            try {
                const res = await fetch(`/api/services/${serviceId}`, {
                    method: "DELETE"
                });

                if (!res.ok) throw new Error("Failed to delete service");

                toast.success("Service deleted");
                router.refresh();
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete service");
            }
        });
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <Trash2 className="w-3.5 h-3.5" />
        </Button>
    );
}
