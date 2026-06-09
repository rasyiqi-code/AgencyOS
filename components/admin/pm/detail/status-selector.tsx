import { useRouter } from "@/lib/router/hooks";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateProjectStatusFn } from "@/src/server/pm";
;

interface StatusSelectorProps {
    projectId: string;
    initialStatus: string;
}

export function StatusSelector({
    projectId,
    initialStatus,
}: StatusSelectorProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function onValueChange(value: string) {
        startTransition(async () => {
            try {
                const result = await updateProjectStatusFn({ data: { projectId, status: value } });
                if (!result.success) throw new Error("Gagal memperbarui status");
                toast.success("Status berhasil diperbarui");
                router.invalidate();
            } catch (error) {
                console.error("Gagal memperbarui status", error);
                toast.error("Gagal memperbarui status");
            }
        });
    }

    return (
        <div className="flex items-center gap-2 w-full text-left">
            <Select
                defaultValue={initialStatus}
                onValueChange={onValueChange}
                disabled={isPending}
            >
                <SelectTrigger className="w-full bg-black/20 border-white/10 text-zinc-200">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="queue">Queue</SelectItem>
                    <SelectItem value="dev">In Development</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                </SelectContent>
            </Select>
            {isPending && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
        </div>
    );
}
