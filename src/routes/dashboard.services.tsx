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
    <div className="w-full py-6 text-left">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-brand-yellow" />
          {isId ? 'Layanan Kami' : 'Our Services'}
        </h1>
        <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
          {isId ? 'Pilih paket layanan kelas enterprise yang dikurasi untuk mempercepat pertumbuhan bisnis Anda.' : 'Choose from our curated enterprise-grade services to accelerate your business growth.'}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl">
        {processedServices.map((service: any) => (
          <ServiceCard key={service.id} service={service as DashboardService} />
        ))}

        {processedServices.length === 0 && (
          <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
            <p className="text-zinc-500 text-lg">{isId ? 'Belum ada layanan tersedia saat ini.' : 'No services available at the moment.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
