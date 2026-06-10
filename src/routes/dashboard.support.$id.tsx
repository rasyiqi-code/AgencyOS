import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { getTicketByIdFn } from '@/src/server/support'
import { ChatInterface } from '@/components/support/chat-interface'

const loader = async ({ params }: { params: { id: string } }) => {
  const { id } = params
  try {
    const ticket = await getTicketByIdFn({ data: id })
    return { ticket }
  } catch (error) {
    console.error('Error loading ticket:', error)
    throw error
  }
}

export const Route = createFileRoute('/dashboard/support/$id')({
  loader,
  component: TicketChatPage,
})

function TicketChatPage() {
  const { ticket } = useLoaderData({ from: Route.id })

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] pt-20">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Support Chat</h1>
      </div>
      <div className="flex-1 bg-black rounded-xl overflow-hidden border border-white/5">
        <ChatInterface initialTicket={ticket as any} />
      </div>
    </div>
  )
}
