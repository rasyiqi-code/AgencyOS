import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAdminProductsFn } from '@/src/server/products'
import { ProductList } from '@/components/admin/products/product-list'
import { ProductForm } from '@/components/admin/products/product-form'
import { ProductStats } from '@/components/admin/products/product-stats'
import { Package } from 'lucide-react'
import { SaaSDocsDialog } from '@/components/admin/products/saas-docs-dialog'
import { type Product } from '@prisma/client'

type ProductWithCount = Product & { _count?: { licenses: number } }

export const Route = createFileRoute('/admin/products')({
  loader: async () => {
    return getAdminProductsFn()
  },
  component: AdminProductsRoute,
})

function AdminProductsRoute() {
  const initialData = Route.useLoaderData() as ProductWithCount[]

  // React Query untuk sinkronisasi state
  const { data } = useQuery<ProductWithCount[]>({
    queryKey: ['admin-products'],
    queryFn: () => getAdminProductsFn() as Promise<ProductWithCount[]>,
    initialData,
  })

  const products = data || []
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const topProduct = products.length > 0
    ? products.reduce((prev, current) => ((prev._count?.licenses || 0) > (current._count?.licenses || 0)) ? prev : current)
    : null

  const isId = true

  return (
    <div className="w-full py-6 space-y-6 text-left animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-yellow" />
            {isId ? 'Produk Digital' : 'Digital Products'}
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            {isId ? 'Kelola katalog produk digital (template, plugin, saas).' : 'Manage your digital products (templates, plugins).'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SaaSDocsDialog />
          <ProductForm />
        </div>
      </div>

      <ProductStats
        totalProducts={totalProducts}
        activeProducts={activeProducts}
        topProduct={topProduct ? { name: topProduct.name, licenses: topProduct._count?.licenses || 0 } : null}
      />

      <ProductList products={products} />
    </div>
  )
}
