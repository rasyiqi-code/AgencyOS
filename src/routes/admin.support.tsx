import { createFileRoute } from '@tanstack/react-router'
import { getAdminTicketsFn } from "@/src/server/support"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, List } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketTable } from "@/components/admin/support/ticket-table"
import { ChatConsole } from "@/components/admin/support/chat-console"

export const Route = createFileRoute('/admin/support')({
  loader: async () => {
    return await getAdminTicketsFn()
  },
  component: AdminSupportInbox,
})

function AdminSupportInbox() {
  const result = Route.useLoaderData()
  const liveChatTickets = result.liveChatTickets || []
  const supportTickets = result.supportTickets || []

  return (
    <div className="w-full py-2 md:py-4 min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-3 md:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-zinc-500 border-zinc-800 tracking-widest text-[10px] uppercase">Support</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Support Inbox
            <Mail className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            Kelola tiket dukungan dan obrolan langsung dengan klien.
          </p>
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
  )
}
