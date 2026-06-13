import { prisma } from "@/lib/config/db";
import { TicketTable } from "@/components/admin/support/ticket-table";
import type { MessageAttachment } from "@/types/payment";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export default async function AdminSupportInbox() {
    const rawTickets = await prisma.ticket.findMany({
        take: 50,
        orderBy: { updatedAt: 'desc' },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    // Serialize for Client Components
    const allTickets = rawTickets.map(t => ({
        ...t,
        type: t.type,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messages: t.messages.map(m => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
            attachments: m.attachments as unknown as MessageAttachment[]
        }))
    }));

    const supportTickets = allTickets.filter(t => t.type === 'ticket');

    return (
        <div className="w-full py-2 md:py-4 min-h-screen flex flex-col">
            <AdminHeaderSetter title="Support Inbox" />

            <div className="mt-2">
                <TicketTable tickets={supportTickets} />
            </div>
        </div>
    );
}
