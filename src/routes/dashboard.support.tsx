import { createFileRoute } from '@tanstack/react-router'
import { getSupportTickets } from '@/src/server/support'
import { TicketList } from '@/components/support/ticket-list'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/dashboard/support')({
  loader: async () => {
    return getSupportTickets()
  },
  component: SupportPage,
})

function SupportPage() {
  const initialData = Route.useLoaderData()
  const { data } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: getSupportTickets,
    initialData: initialData ?? undefined,
  })

  if (!data) {
    return <div className="text-zinc-500 p-8">Please sign in to view support tickets.</div>
  }

  const { locale, tickets } = data
  const isId = locale === 'id'

  return (
    <div className="flex flex-col gap-2 text-left w-full">
      <TicketList tickets={tickets} />
    </div>
  )
}
