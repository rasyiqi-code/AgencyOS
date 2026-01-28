"use client";

import NextLink from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Mail, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export type ClientUser = {
    id: string;
    displayName: string | null;
    email: string | null;
    profileImageUrl: string | null;
    createdAt: Date | string | null;
    lastActiveAt: Date | string | null;
    projects?: { title: string; status: string }[];
};

export const clientColumns: ColumnDef<ClientUser>[] = [
    {
        accessorKey: "profile",
        header: "User Profile",
        size: 300,
        cell: ({ row }) => {
            const user = row.original;
            const initials = user.displayName
                ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : user.email?.slice(0, 2).toUpperCase() || "??";

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-lg border border-zinc-800">
                        <AvatarImage src={user.profileImageUrl || ""} alt={user.displayName || "User"} />
                        <AvatarFallback className="rounded-lg bg-zinc-800 text-zinc-400 text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-medium text-white text-sm truncate">
                            {user.displayName || "Unnamed User"}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user.email}</span>
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "id",
        header: "User ID",
        size: 200,
        cell: ({ row }) => {
            const id = row.original.id;
            return (
                <div className="flex items-center gap-1.5 group/id w-full overflow-hidden">
                    <span className="font-mono text-[11px] text-zinc-500 truncate flex-1 min-w-0" title={id}>
                        {id}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover/id:opacity-100 transition-opacity bg-zinc-800/50 hover:bg-zinc-800 hover:text-white text-zinc-400 shrink-0"
                        onClick={() => {
                            navigator.clipboard.writeText(id);
                            toast.success("User ID copied");
                        }}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Joined",
        size: 150,
        cell: ({ row }) => {
            const date = row.original.createdAt ? new Date(row.original.createdAt) : null;
            return (
                <div className="text-zinc-500 text-[11px] whitespace-nowrap">
                    {date ? date.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }) : "-"}
                </div>
            );
        },
    },
    {
        accessorKey: "projects",
        header: "Projects Ordered",
        size: 300,
        cell: ({ row }) => {
            const projects = row.original.projects || [];

            if (projects.length === 0) {
                return <span className="text-zinc-600 text-[11px] italic">No projects yet</span>;
            }

            return (
                <NextLink
                    href={`/admin/pm/projects?query=${row.original.id}`}
                    className="group flex items-center gap-1.5 w-fit hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors"
                >
                    <Badge
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-300 border-zinc-700 group-hover:border-zinc-600 group-hover:text-white transition-colors"
                    >
                        {projects.length}
                    </Badge>
                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 underline-offset-4 group-hover:underline decoration-zinc-600 cursor-pointer">
                        {projects.length === 1 ? 'Project' : 'Projects'}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors opacity-0 group-hover:opacity-100" />
                </NextLink>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 100,
        cell: () => {
            // Stack Auth doesn't expose strict "Active" boolean in basic user object usually, 
            // but we can infer or just show "Registered".
            // For now, let's just show a simple badge.
            return (
                <Badge variant="outline" className="text-zinc-400 border-zinc-700 bg-zinc-900/50 text-[10px] font-normal h-5">
                    Registered
                </Badge>
            );
        },
    },
];
