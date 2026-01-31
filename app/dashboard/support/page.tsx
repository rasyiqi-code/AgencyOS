import { TicketList } from "@/components/support/ticket-list";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

export default async function SupportPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    const tickets = await prisma.ticket.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    // Serializable ticket data
    const serializableTickets = tickets.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messages: t.messages.map(m => ({
            ...m,
            createdAt: m.createdAt.toISOString()
        }))
    }));

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{isId ? 'Bantuan' : 'Support'}</h1>
                <p className="text-zinc-400">{isId ? 'Butuh bantuan dengan proyek Anda? Kami siap membantu.' : 'Need help with your project? We are here.'}</p>
            </div>

            <TicketList tickets={serializableTickets} />
        </div>
    );
}
