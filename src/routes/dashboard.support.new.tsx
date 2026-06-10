import { createFileRoute, redirect } from '@tanstack/react-router'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { CreateTicketForm } from '@/components/support/create-ticket-form'

const loader = async () => {
  const user = await hexclaveServerApp.getUser()
  if (!user) {
    throw redirect({ href: '/handler/sign-in' })
  }
  return {}
}

export const Route = createFileRoute('/dashboard/support/new')({
  loader,
  component: NewTicketPage,
})

function NewTicketPage() {
  return (
    <div className="flex flex-col gap-6 pt-20">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Create New Ticket</h1>
        <p className="text-zinc-400">Describe your issue or request and we&apos;ll get back to you.</p>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-xl">
        <CreateTicketForm />
      </div>
    </div>
  )
}
