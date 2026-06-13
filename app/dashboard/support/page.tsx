import { TicketList } from "@/components/support/ticket-list";
import { prisma } from "@/lib/config/db";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

type TicketWithMessages = Prisma.TicketGetPayload<{
    include: { messages: { take: 1; orderBy: { createdAt: 'desc' } } }
}>;

export default async function SupportPage() {
    const user = await hexclaveServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const tickets = await prisma.ticket.findMany({
        take: 50,
        where: { userId: user.id, type: 'ticket' } as Prisma.TicketWhereInput,
        orderBy: { updatedAt: 'desc' },
        include: {
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            }
        }
    }) as TicketWithMessages[];

    // Serializable ticket data
    const serializableTickets = tickets.map((t: TicketWithMessages) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messages: t.messages.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString()
        }))
    }));

    return (
        <div className="flex flex-col gap-6">


            <TicketList tickets={serializableTickets} />
        </div>
    );
}
