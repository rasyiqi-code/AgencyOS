import { createFileRoute } from '@tanstack/react-router'
import { getClientBillingDataFn } from '@/src/server/client-dashboard'
import { BillingList, type BillingOrder } from '@/components/dashboard/billing/billing-list'
import { UnpaidBills } from '@/components/dashboard/billing/unpaid-bills'
import { Receipt } from 'lucide-react'

export const Route = createFileRoute('/dashboard/billing')({
  loader: async () => {
    return await getClientBillingDataFn()
  },
  component: ClientBillingPage,
})

function ClientBillingPage() {
  const data = Route.useLoaderData()
  if (!data || !data.success) {
    return <div className="text-zinc-500 p-8 text-left">Gagal memuat data billing atau Anda tidak memiliki akses.</div>
  }

  const { orders, unpaidEstimates, projectsNeedingRenewal, locale } = data
  const isId = locale === 'id-ID' || locale === 'id'

  return (
    <div className="w-full py-6">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Receipt className="w-8 h-8 text-brand-yellow" />
          {isId ? 'Tagihan & Faktur' : 'Billing & Invoices'}
        </h1>
        <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
          {isId ? 'Lacak riwayat pembayaran dan unduh faktur Anda.' : 'Track your payment history and download invoices.'}
        </p>
      </div>

      <UnpaidBills unpaidEstimates={unpaidEstimates} projectsNeedingRenewal={projectsNeedingRenewal} />

      <BillingList orders={orders as unknown as BillingOrder[]} />
    </div>
  )
}
