import { useTransition } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteAdminServiceFn } from "@/src/server/pm";

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm("Are you sure you want to delete this service?")) return;

        const element = document.getElementById(`service-item-${serviceId}`);
        if (element) {
            element.style.display = 'none';
        }

        startTransition(async () => {
            try {
                const result = await deleteAdminServiceFn({ data: serviceId });

                if (!result.success) {
                    if (element) element.style.display = '';
                    throw new Error("Failed to delete service");
                }

                toast.success("Service deleted");
                router.invalidate();
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
