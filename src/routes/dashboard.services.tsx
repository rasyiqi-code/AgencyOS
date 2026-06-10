import { createFileRoute } from '@tanstack/react-router'
import { getClientServicesFn } from '@/src/server/client-dashboard'
import { Sparkles } from "lucide-react"
import { ServiceCard } from "@/components/dashboard/services/service-card"
import { Service as DashboardService } from "@/components/dashboard/services/service-modal-content"

export const Route = createFileRoute('/dashboard/services')({
  loader: async () => {
    return await getClientServicesFn()
  },
  component: ClientServicesPage,
})

function ClientServicesPage() {
  const result = Route.useLoaderData()
  if (!result || !result.success) {
    return <div className="text-zinc-500 p-8 text-left">Gagal memuat layanan atau Anda tidak memiliki akses.</div>
  }

  const { processedServices, locale } = result
  const isId = locale === 'id-ID' || locale === 'id'

  return (
    <div className="w-full py-4 text-left">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-7xl">
        {processedServices.map((service: any) => (
          <ServiceCard key={service.id} service={service as DashboardService} />
        ))}

        {processedServices.length === 0 && (
          <div className="col-span-full text-center py-10 bg-zinc-900/30 rounded-3xl border border-white/5">
            <p className="text-zinc-500 text-base">{isId ? 'Belum ada layanan tersedia saat ini.' : 'No services available at the moment.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
