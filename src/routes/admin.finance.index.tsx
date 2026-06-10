import { createFileRoute, redirect } from '@tanstack/react-router'
import { canManageBilling } from '@/lib/shared/auth-helpers'
import { BillingDashboardView } from '@/components/admin/views/billing-view'
import { getBillingDashboardData } from '@/src/server/admin'
import { z } from 'zod'

const financeSearchSchema = z.object({
  mode: z.string().optional().catch('services'),
})

export const Route = createFileRoute('/admin/finance/')({
  validateSearch: (search) => financeSearchSchema.parse(search),
  loaderDeps: ({ search: { mode } }) => ({ mode }),
  loader: async ({ deps }) => {
    const hasAccess = await canManageBilling()
    if (!hasAccess) {
      throw redirect({ href: '/dashboard' })
    }
    const mode = deps.mode || 'services'
    const stats = await getBillingDashboardData({ data: mode })
    return { stats }
  },
  component: FinanceDashboardPage,
})

function FinanceDashboardPage() {
  const search = Route.useSearch()
  const { stats } = Route.useLoaderData()
  const mode = search.mode || 'services'

  return (
    <div className="flex flex-col gap-4">
      <BillingDashboardView mode={mode} stats={stats} />
    </div>
  )
}
