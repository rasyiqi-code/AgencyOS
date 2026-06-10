import { createFileRoute } from '@tanstack/react-router'
import { getClientLicenses } from '@/src/server/licenses'
import { LicenseCard } from '@/components/dashboard/my-products/license-card'
import { Package } from 'lucide-react'

export const Route = createFileRoute('/dashboard/my-products')({
  loader: async () => {
    return await getClientLicenses()
  },
  component: MyProductsPage,
})

function MyProductsPage() {
  const result = Route.useLoaderData()
  
  const licenses = result.success ? (result.licenses || []) : []

  return (
    <div className="space-y-4 py-4 text-left w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-yellow" />
          Produk Saya
        </h1>
        <p className="text-zinc-400 mt-0.5 text-xs">
          Kelola lisensi dan unduh produk digital yang telah Anda beli.
        </p>
      </div>

      {/* Grid Kartu Lisensi */}
      {licenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
          <Package className="w-10 h-10 text-zinc-700 mb-3" />
          <h3 className="text-base font-medium text-zinc-400">Belum ada produk</h3>
          <p className="text-xs text-zinc-600 mt-0.5">
            Produk digital yang Anda beli akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {licenses.map((license: any) => (
            <LicenseCard
              key={license.id}
              license={{
                ...license,
                currentActivations: license.activations,
                product: {
                  ...license.product,
                  image: license.product?.image || null,
                  fileUrl: license.product?.fileUrl || null,
                  purchaseType: license.product?.purchaseType || 'one_time',
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
