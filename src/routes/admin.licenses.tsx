import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAdminLicensesFn, getAdminProductsFn } from '@/src/server/products'
import { LicenseList } from '@/components/admin/licenses/license-list'
import { LicenseGenerator } from '@/components/admin/licenses/license-generator'
import { LicenseStats } from '@/components/admin/licenses/license-stats'
import { Key } from 'lucide-react'
import { type Product } from '@prisma/client'

// Loader data types
interface LicenseData {
  id: string
  key: string
  status: string
  activations: number
  maxActivations: number
  expiresAt: string | null
  createdAt: string
  userId: string | null
  product: { name: string; slug: string } | null
  digitalOrder: {
    userEmail: string
    userName: string | null
    status: string
  } | null
}

interface LicensesPageData {
  licenses: LicenseData[]
  products: Product[]
}

export const Route = createFileRoute('/admin/licenses')({
  loader: async () => {
    const [licenses, products] = await Promise.all([
      getAdminLicensesFn(),
      getAdminProductsFn(),
    ])
    return {
      licenses,
      products: (products as unknown as Product[]).filter(p => p.isActive),
    }
  },
  component: AdminLicensesRoute,
})

function AdminLicensesRoute() {
  const initialData = Route.useLoaderData() as LicensesPageData

  // React Query untuk sinkronisasi state
  const { data } = useQuery<LicensesPageData>({
    queryKey: ['admin-licenses'],
    queryFn: async () => {
      const [licenses, products] = await Promise.all([
        getAdminLicensesFn(),
        getAdminProductsFn(),
      ])
      return {
        licenses: licenses as unknown as LicenseData[],
        products: (products as unknown as Product[]).filter(p => p.isActive),
      }
    },
    initialData,
  })

  const licenses = data?.licenses || []
  const products = data?.products || []

  // Menghitung statistik lisensi
  const totalLicenses = licenses.length
  const activeLicenses = licenses.filter(l => l.status === 'active').length
  const licensedProductIds = Array.from(new Set(licenses.map(l => l.product?.slug).filter(Boolean)))

  const isId = true

  // Konversi format tanggal di list ke format Date untuk kompatibilitas LicenseList
  const formattedLicenses = licenses.map(l => ({
    ...l,
    expiresAt: l.expiresAt ? new Date(l.expiresAt) : null,
    createdAt: new Date(l.createdAt),
    product: l.product || { name: 'Unknown Product', slug: 'unknown' }
  }))

  return (
    <div className="w-full py-6 space-y-6 text-left animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-brand-yellow" />
            {isId ? 'Lisensi API' : 'Licenses'}
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            {isId ? 'Kelola kunci lisensi API dan aktivasi produk digital.' : 'Manage API keys and product activations.'}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <LicenseGenerator products={products} />
        </div>
      </div>

      <LicenseStats
        totalLicenses={totalLicenses}
        activeLicenses={activeLicenses}
        totalProducts={licensedProductIds.length}
      />

      <LicenseList licenses={formattedLicenses} />
    </div>
  )
}
