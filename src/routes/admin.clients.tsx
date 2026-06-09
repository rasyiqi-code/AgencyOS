import { createFileRoute } from '@tanstack/react-router'
import { getAdminClientsFn } from "@/src/server/clients"
import { ClientsDataTable } from "@/components/admin/clients/clients-data-table"
import { clientColumns } from "@/components/admin/clients/client-columns"
import { User } from "lucide-react"

export const Route = createFileRoute('/admin/clients')({
  loader: async () => {
    return await getAdminClientsFn()
  },
  component: AdminClientsPage,
})

function AdminClientsPage() {
  const result = Route.useLoaderData()
  const clients = result.clients || []
  const totalClients = result.totalClients || 0

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            Client Management
            <User className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            View and manage registered client accounts.
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">Total Clients</div>
          <div className="text-2xl font-mono font-bold text-white">{totalClients}</div>
        </div>
      </div>

      <ClientsDataTable columns={clientColumns} data={clients} />
    </div>
  )
}
