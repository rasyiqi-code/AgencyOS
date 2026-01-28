import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketTable } from "@/components/admin/support/ticket-table";
import { ChatConsole } from "@/components/admin/support/chat-console";
import type { MessageAttachment } from "@/types/payment";

export default async function AdminSupportInbox() {
    const rawTickets = await prisma.ticket.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            messages: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    // Serialize for Client Components
    const tickets = rawTickets.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messages: t.messages.map(m => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
            attachments: m.attachments as unknown as MessageAttachment[]
        }))
    }));

    return (
        <div className="w-full py-6 h-screen flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px]">Support</Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Support Inbox
                        <Mail className="w-6 h-6 text-zinc-600" />
                    </h1>
                </div>
            </div>

            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-zinc-900 border border-white/5">
                        <TabsTrigger value="chat" className="data-[state=active]:bg-zinc-800">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Live Chat
                        </TabsTrigger>
                        <TabsTrigger value="table" className="data-[state=active]:bg-zinc-800">
                            <List className="w-4 h-4 mr-2" />
                            All Tickets
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="chat" className="flex-1 mt-0">
                    <ChatConsole tickets={tickets} />
                </TabsContent>

                <TabsContent value="table" className="mt-0">
                    <TicketTable tickets={tickets} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
