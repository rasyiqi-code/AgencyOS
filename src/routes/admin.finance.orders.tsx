import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAdminFinanceOrdersFn } from '@/src/server/finance'
import { FinanceList } from '@/components/admin/finance/finance-list'
import { ShoppingCart } from 'lucide-react'
import { FinanceData } from '@/components/admin/finance/finance-columns'

export const Route = createFileRoute('/admin/finance/orders')({
  loader: async () => {
    return getAdminFinanceOrdersFn()
  },
  component: AdminFinanceOrdersRoute,
})

function AdminFinanceOrdersRoute() {
  const initialData = Route.useLoaderData() as FinanceData[]

  // Sinkronisasi data menggunakan React Query
  const { data } = useQuery<FinanceData[]>({
    queryKey: ['admin-finance-orders'],
    queryFn: () => getAdminFinanceOrdersFn() as Promise<FinanceData[]>,
    initialData,
  })

  // Deteksi locale (default bilingual/Indonesia sesuai panduan)
  const isId = true

  const orders = data || []

  return (
    <div className="w-full py-6 text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-4 group">
            {isId ? 'Kelola Invoice & Pesanan' : 'Manage Invoices & Orders'}
            <div className="relative p-2 rounded-xl bg-zinc-900 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
              <ShoppingCart className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              {orders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-black">
                  {orders.length}
                </span>
              )}
            </div>
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm max-w-xl leading-relaxed">
            {isId 
              ? 'Akses penuh ke riwayat pesanan layanan dan verifikasi pembayaran.'
              : 'Full access to service order history and payment verification.'}
          </p>
        </div>
      </div>

      <FinanceList data={orders} />

      <div className="mt-8 flex items-center justify-between text-[11px] text-zinc-600 px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 
            {isId ? 'Sinkronisasi Otomatis' : 'Auto Sync'}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 
            {isId ? 'Menunggu Konfirmasi' : 'Pending Confirmation'}
          </span>
        </div>
      </div>
    </div>
  )
}
