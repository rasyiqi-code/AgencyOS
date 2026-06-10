import { createFileRoute } from '@tanstack/react-router'
import { getClientBillingDataFn } from '@/src/server/client-dashboard'
import { BillingList, type BillingOrder } from '@/components/dashboard/billing/billing-list'
import { UnpaidBills } from '@/components/dashboard/billing/unpaid-bills'

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
    <div className="w-full py-2">
      <UnpaidBills unpaidEstimates={unpaidEstimates} projectsNeedingRenewal={projectsNeedingRenewal} />

      <BillingList orders={orders as unknown as BillingOrder[]} />
    </div>
  )
}
