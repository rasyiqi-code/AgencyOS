import { createFileRoute } from '@tanstack/react-router'
import { getProductsForSimulatorFn } from '@/src/server/admin'
import { WebhookSimulator } from '@/components/admin/system/webhooks/simulator-client'
import { Globe } from 'lucide-react'

// Definisi rute untuk halaman simulator webhook admin sistem
export const Route = createFileRoute('/admin/system/webhooks')({
  loader: async () => {
    // Ambil daftar produk dengan url webhook eksternal dari server function
    return await getProductsForSimulatorFn()
  },
  component: WebhookSimulatorRoute,
})

function WebhookSimulatorRoute() {
  const products = Route.useLoaderData()

  return (
    <div className="w-full py-1 md:py-4 space-y-4 md:space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand-yellow" />
            Webhook Simulator
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            Test your SaaS integrations by simulating outgoing events.
          </p>
        </div>
      </div>

      {/* Komponen Simulator Webhook */}
      <WebhookSimulator products={products} />
    </div>
  )
}
