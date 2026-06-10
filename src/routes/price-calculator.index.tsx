import { createFileRoute } from '@tanstack/react-router'
import { QuoteForm } from '@/components/quote/quote-form'
import { isAdminFn } from '@/src/server/auth'

export const Route = createFileRoute('/price-calculator/')({
  loader: async () => {
    try {
      const isUserAdmin = await isAdminFn()
      return { isAdmin: isUserAdmin }
    } catch {
      return { isAdmin: false }
    }
  },
  component: PriceCalculatorPage,
})

function PriceCalculatorPage() {
  const { isAdmin } = Route.useLoaderData()
  return (
    <div className="min-h-screen bg-black selection:bg-blue-500/30">
      <QuoteForm isAdmin={isAdmin} />
    </div>
  )
}
