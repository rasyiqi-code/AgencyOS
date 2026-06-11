import { ChatInterface } from "@/components/support/chat-interface";
import { prisma } from "@/lib/config/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";
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
            <AdminHeaderSetter
                title={
                    <span className="flex items-center gap-2 max-w-[200px] sm:max-w-xs md:max-w-md truncate">
                        <span className="truncate">Ticket #{ticket.id.slice(-6).toUpperCase()}</span>
                        <Badge variant="outline" className="shrink-0 font-mono text-[9px] h-4 px-1 uppercase border-white/10 text-zinc-300">{ticket.status}</Badge>
                    </span>
                }
                actions={
                    <span className="text-[10px] sm:text-xs text-zinc-400 truncate hidden sm:inline-block bg-white/5 border border-white/5 px-3 py-1 rounded-lg">
                        Client: {ticket.email}
                    </span>
                }
            />

            <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
                <ChatInterface initialTicket={serializableTicket} isAdmin={true} />
            </div>
        </div>
    );
}
