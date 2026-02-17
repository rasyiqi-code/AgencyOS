"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/shared/utils";

// Reuse types or define locally if simple
interface Ticket {
    id: string;
    name: string | null;
    email: string | null;
    status: string;
    type: string;
    updatedAt: Date | string;
    messages: { content: string }[];
}

interface TicketTableProps {
    tickets: Ticket[];
}

export function TicketTable({ tickets }: TicketTableProps) {
    return (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Table className="min-w-[800px]">
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-zinc-400">Client</TableHead>
                            <TableHead className="text-zinc-400">Subject / ID</TableHead>
                            <TableHead className="text-zinc-400">Last Message</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400">Last Updated</TableHead>
                            <TableHead className="text-right text-zinc-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow className="border-white/5">
                                <TableCell colSpan={6} className="text-center h-32 text-zinc-500">
                                    No tickets found.
                                </TableCell>
                            </TableRow>
                        ) : tickets.map((ticket) => (
                            <TableRow key={ticket.id} className="hover:bg-white/5 border-white/5">
                                <TableCell className="text-zinc-300">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{ticket.name || "Unknown"}</span>
                                        <span className="text-xs text-zinc-500">{ticket.email || "No Email"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-zinc-500">
                                    #{ticket.id.slice(-8).toUpperCase()}
                                </TableCell>
                                <TableCell className="text-zinc-300 max-w-[250px] truncate">
                                    {ticket.messages[0]?.content || "No messages"}
                                </TableCell>
                                <TableCell>
                                    <Badge className={
                                        ticket.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            ticket.status === 'closed' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' :
                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    }>
                                        {ticket.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-500 text-xs">
                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/admin/support/${ticket.id}`}>
                                        <Button size="sm" variant="outline" className="h-8 bg-zinc-900 border-zinc-700 hover:bg-zinc-800">
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Reply
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-white/5">
                {tickets.length === 0 ? (
                    <div className="text-center p-8 text-zinc-500 text-sm">No tickets found.</div>
                ) : tickets.map((ticket) => (
                    <div key={ticket.id} className="p-3 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-white text-sm truncate">{ticket.name || "Unknown"}</span>
                                <span className="text-[10px] text-zinc-500 truncate">{ticket.email || "No Email"}</span>
                            </div>
                            <Badge className={cn(
                                "shrink-0 text-[9px] h-4 px-1.5",
                                ticket.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    ticket.status === 'closed' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' :
                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            )}>
                                {ticket.status.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                            {ticket.messages[0]?.content || "No messages"}
                        </p>
                        <div className="flex justify-between items-center pt-1">
                            <span className="font-mono text-[9px] text-zinc-600">#{ticket.id.slice(-8).toUpperCase()}</span>
                            <span className="text-[9px] text-zinc-600 font-medium">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="pt-1">
                            <Link href={`/admin/support/${ticket.id}`} className="block w-full">
                                <Button variant="outline" className="w-full h-8 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-[11px] font-medium">
                                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Reply
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
