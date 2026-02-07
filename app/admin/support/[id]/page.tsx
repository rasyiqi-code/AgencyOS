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
        <div className="flex flex-col h-[calc(100vh-100px)] py-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/support">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            Ticket #{ticket.id.slice(-6).toUpperCase()}
                            <Badge variant="outline" className="ml-2 font-mono text-xs">{ticket.status}</Badge>
                        </h1>
                        <p className="text-zinc-400 text-sm">Client: {ticket.email}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
                <ChatInterface initialTicket={serializableTicket} isAdmin={true} />
            </div>
        </div>
    );
}
