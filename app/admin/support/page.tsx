import { prisma } from "@/lib/config/db";
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

    const liveChatTickets = allTickets.filter(t => t.type === 'chat');
    const supportTickets = allTickets.filter(t => t.type === 'ticket');

    return (
        <div className="w-full py-2 md:py-4 min-h-screen flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-3 md:gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[9px] h-4 px-1.5">Support</Badge>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                        Support Inbox
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-zinc-600" />
                    </h1>
                </div>
            </div>

            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3 overflow-x-auto pb-1 md:pb-0">
                    <TabsList className="bg-zinc-900/50 border border-white/5 w-full md:w-auto justify-start md:justify-center h-9">
                        <TabsTrigger value="chat" className="flex-1 md:flex-none data-[state=active]:bg-zinc-800 text-xs py-1.5 h-7">
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                            Live Chat
                        </TabsTrigger>
                        <TabsTrigger value="table" className="flex-1 md:flex-none data-[state=active]:bg-zinc-800 text-xs py-1.5 h-7">
                            <List className="w-3.5 h-3.5 mr-1.5" />
                            All Tickets
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="chat" className="flex-1 mt-0">
                    <ChatConsole tickets={liveChatTickets} />
                </TabsContent>

                <TabsContent value="table" className="mt-0">
                    <TicketTable tickets={supportTickets} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
