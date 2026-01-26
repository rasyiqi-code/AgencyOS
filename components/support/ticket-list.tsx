"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquarePlus, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Ticket {
    id: string;
    status: string;
    createdAt: string;
    messages: {
        id: string;
        content: string;
        createdAt: string;
    }[];
}

interface TicketListProps {
    tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
    const router = useRouter();

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Your Tickets</h2>
                <Link href="/dashboard/support/new">
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <MessageSquarePlus className="w-4 h-4 mr-2" />
                        Create Ticket
                    </Button>
                </Link>
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-zinc-400">ID</TableHead>
                            <TableHead className="text-zinc-400">Last Message</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400">Last Updated</TableHead>
                            <TableHead className="text-right text-zinc-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow className="border-white/5">
                                <TableCell colSpan={5} className="text-center h-32 text-zinc-500">
                                    No tickets found. Need help? Create a new ticket.
                                </TableCell>
                            </TableRow>
                        ) : tickets.map((ticket) => (
                            <TableRow
                                key={ticket.id}
                                className="hover:bg-white/5 border-white/5 cursor-pointer"
                                onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                            >
                                <TableCell className="font-mono text-xs text-zinc-500">
                                    #{ticket.id.slice(-6).toUpperCase()}
                                </TableCell>
                                <TableCell className="text-zinc-300 max-w-[300px] truncate">
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
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400">
                                        <MessageCircle className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
