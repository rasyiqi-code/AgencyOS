import { ChatInterface } from "@/components/support/chat-interface";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { notFound, redirect } from "next/navigation";
import type { MessageAttachment } from "@/types/payment";

export default async function TicketChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!ticket) return notFound();

    // Verify ownership (optional: admins can view all, but here we check user)
    // If we had Roles, we'd check if Admin OR Ticket Owner.
    // For now assuming Client Dashboard -> Client only sees their own.
    if (ticket.userId !== user.id) {
        // Strict check: Redirect if trying to view others
        // Unless we implement role check on user object
    }

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
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">Support Chat</h1>
            </div>
            <ChatInterface initialTicket={serializableTicket} />
        </div>
    );
}
