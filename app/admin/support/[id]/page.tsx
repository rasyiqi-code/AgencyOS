import { ChatInterface } from "@/components/support/chat-interface";
import { prisma } from "@/lib/config/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { MessageAttachment } from "@/types/payment";

export default async function AdminTicketChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!ticket) return notFound();

    // Serializable ticket data
    const serializableTicket = {
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        messages: ticket.messages.map(m => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
            attachments: m.attachments as unknown as MessageAttachment[]
        }))
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-80px)] py-2 md:py-4">
            <div className="mb-3 md:mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                    <Link href="/admin/support" className="shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400">
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2 truncate">
                            <span className="truncate">Ticket #{ticket.id.slice(-6).toUpperCase()}</span>
                            <Badge variant="outline" className="shrink-0 font-mono text-[9px] h-4 px-1">{ticket.status}</Badge>
                        </h1>
                        <p className="text-zinc-500 text-[10px] md:text-xs truncate">Client: {ticket.email}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
                <ChatInterface initialTicket={serializableTicket} isAdmin={true} />
            </div>
        </div>
    );
}
