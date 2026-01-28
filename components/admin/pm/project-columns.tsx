"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings2, Copy } from "lucide-react";
import { toast } from "sonner";

/**
 * Calculates a tight column size based on the character count of the header.
 * 10px font size + tracking-wider approx 8.5px per char.
 */
const calculateHeaderSize = (header: string) => {
    const text = header.trim();
    if (!text) return 0;
    return (text.length * 8.5) + 20; // Very tight fit
};

import { type ExtendedProject } from "@/lib/types";

export const columns: ColumnDef<ExtendedProject>[] = [
    {
        accessorKey: "title",
        header: "Project Title",
        size: 500, // Priority expansion
        minSize: 100,
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5 leading-tight overflow-hidden">
                <span className="font-medium text-white text-sm whitespace-nowrap truncate">{row.getValue("title")}</span>
                {row.original.description && (
                    <span className="text-[11px] text-zinc-500 truncate" title={row.original.description}>
                        {row.original.description}
                    </span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "clientName",
        header: "Client Name",
        size: calculateHeaderSize("Client Name") + 20,
        minSize: 20,
        cell: ({ row }) => {
            const name = row.original.clientName;
            return (
                <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-white text-sm whitespace-nowrap truncate">{name || "Unnamed Client"}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "service",
        header: "Service",
        size: calculateHeaderSize("Service"),
        minSize: 20,
        cell: ({ row }) => {
            const service = row.original.service;
            return service ? (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-normal py-0 px-2 h-5 text-[10px]">
                    Product
                </Badge>
            ) : (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 font-normal py-0 px-2 h-5 text-[10px]">
                    Service
                </Badge>
            );
        },
    },
    {
        accessorKey: "userId",
        header: "Client ID",
        size: calculateHeaderSize("Client ID"),
        minSize: 20,
        cell: ({ row }) => {
            const id = String(row.getValue("userId"));
            return (
                <div className="flex items-center gap-1.5 group/id w-full overflow-hidden">
                    <span className="font-mono text-[11px] text-zinc-500 truncate flex-1 min-w-0" title={id}>
                        {id}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover/id:opacity-100 transition-opacity bg-zinc-800/50 hover:bg-zinc-800 hover:text-white text-zinc-400 shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(id);
                            toast.success("Client ID copied to clipboard");
                        }}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: "invoiceId",
        header: "Invoice ID",
        size: calculateHeaderSize("Invoice ID"),
        minSize: 20,
        cell: ({ row }) => {
            const id = row.original.invoiceId;
            if (!id) return <span className="text-zinc-600 italic text-[11px]">No Invoice</span>;

            return (
                <div className="flex items-center gap-1.5 group/id w-full overflow-hidden">
                    <span className="font-mono text-[11px] text-zinc-500 truncate flex-1 min-w-0" title={id}>
                        {id}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover/id:opacity-100 transition-opacity bg-zinc-800/50 hover:bg-zinc-800 hover:text-white text-zinc-400 shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(id);
                            toast.success("Invoice ID copied to clipboard");
                        }}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        size: calculateHeaderSize("Status"),
        minSize: 20,
        cell: ({ row }) => {
            const status = String(row.getValue("status"));
            return (
                <Badge
                    variant={
                        status === 'done' ? 'default' :
                            status === 'dev' ? 'secondary' :
                                'outline'
                    }
                    className={`py-0 px-2 h-5 text-[10px] ${status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        status === 'dev' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'text-zinc-400 border-zinc-700'
                        }`}
                >
                    {status.toUpperCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        size: calculateHeaderSize("Created"),
        minSize: 20,
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div className="text-zinc-500 text-[11px] whitespace-nowrap">{date.toLocaleDateString()}</div>;
        },
    },
    {
        id: "actions",
        header: "",
        size: 48,
        enableResizing: false,
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:text-white hover:bg-white/10 text-zinc-500" title="Manage Project">
                    <Link href={`/admin/pm/${row.original.id}`}>
                        <Settings2 className="w-4 h-4" />
                    </Link>
                </Button>
            </div>
        ),
    },
];
