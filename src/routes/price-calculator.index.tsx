import { createFileRoute } from '@tanstack/react-router'
import { QuoteForm } from '@/components/quote/quote-form'
import { isAdmin } from '@/lib/shared/auth-helpers'

export const Route = createFileRoute('/price-calculator/')({
  loader: async () => {
    try {
      const isUserAdmin = await isAdmin()
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
