import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { getTicketByIdFn } from '@/src/server/support'
import { ChatInterface } from '@/components/support/chat-interface'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const loader = async ({ params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const ticket = await getTicketByIdFn({ data: id })
    return { ticket }
  } catch (error) {
    console.error('Error loading admin ticket support:', error)
    throw error
  }
}

export const Route = createFileRoute('/admin/support/$id')({
  loader,
  component: AdminTicketChatPage,
})

function AdminTicketChatPage() {
  const { ticket } = useLoaderData({ from: Route.id })

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-80px)] py-2 md:py-4">
      <div className="mb-3 md:mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          <a href="/admin/support" className="shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </a>
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
        <ChatInterface initialTicket={ticket as any} isAdmin={true} />
      </div>
    </div>
  )
}
