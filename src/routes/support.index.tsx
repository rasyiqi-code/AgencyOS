import { createFileRoute } from '@tanstack/react-router'
import { TicketList } from '@/components/support/ticket-list'

export const Route = createFileRoute('/support/')({
  component: SupportPage,
})

function SupportPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-zinc-400 mb-8">
          Browse our knowledge base or submit a ticket.
        </p>
        <TicketList tickets={[]} />
      </div>
    </div>
  )
}
