"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm("Are you sure you want to delete this service?")) return;

        // Optimistically hide the element for instant feedback
        const element = document.getElementById(`service-item-${serviceId}`);
        if (element) {
            element.style.display = 'none';
        }

        startTransition(async () => {
            try {
                const res = await fetch(`/api/services/${serviceId}`, {
                    method: "DELETE"
                });

                if (!res.ok) {
                    // Revert optimistic update if it fails
                    if (element) element.style.display = '';
                    throw new Error("Failed to delete service");
                }

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
            className="h-8 w-8 transition-all"
        >
            <Trash2 className="w-3.5 h-3.5" />
        </Button>
    );
}
