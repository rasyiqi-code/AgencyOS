"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ProjectFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilter = (status: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");

        if (status && status !== "all") {
            params.set("status", status);
        } else {
            params.delete("status");
        }

        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <Select
            onValueChange={handleFilter}
            defaultValue={searchParams.get("status")?.toString() || "all"}
        >
            <SelectTrigger className="w-[180px] bg-zinc-900/50 border-white/10 text-zinc-400">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="queue">Queue</SelectItem>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
            </SelectContent>
        </Select>
    );
}
