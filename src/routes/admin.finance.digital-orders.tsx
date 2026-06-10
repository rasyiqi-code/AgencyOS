import { createFileRoute } from '@tanstack/react-router'
import { getDigitalOrdersFn } from '@/src/server/digital-orders'
import { DigitalOrderList } from '@/components/admin/finance/digital-order-list'
import { ShoppingCart } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/hooks'

// Definisi rute untuk halaman digital orders admin keuangan
export const Route = createFileRoute('/admin/finance/digital-orders')({
  loader: async () => {
    // Ambil daftar pesanan produk digital dari server function
    return await getDigitalOrdersFn()
  },
  component: AdminDigitalOrdersRoute,
})

function AdminDigitalOrdersRoute() {
  const orders = Route.useLoaderData()
  const t = useTranslations('Admin.Finance.DigitalOrders')
  const tf = useTranslations('Admin.Finance')

  return (
    <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-6 md:py-8">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-6">
        <div className="space-y-1.5 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            {t('title')}
            <ShoppingCart className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm max-w-xl leading-relaxed">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Komponen Daftar Pesanan */}
      <DigitalOrderList orders={orders as any} />

      {/* Footer Status Sinkronisasi */}
      <div className="mt-8 flex items-center justify-between text-[11px] text-zinc-600 px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {tf('autoSync')}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {tf('pendingUpdates')}
          </span>
        </div>
      </div>
    </div>
  )
}
