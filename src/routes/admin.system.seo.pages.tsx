import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { SystemNav } from '@/components/admin/system-nav'
import { PageSeoList } from '@/components/admin/system/page-seo-list'
import { Search } from 'lucide-react'
import { getPageSeoListFn } from '@/src/server/settings'

// Tipe data PageSeo yang diharapkan oleh komponen PageSeoList
interface PageSeo {
  id: string
  path: string
  title: string | null
  title_id: string | null
  description: string | null
  description_id: string | null
  keywords: string | null
  keywords_id: string | null
  ogImage: string | null
}

// Rute TanStack Start untuk Halaman SEO Manager
export const Route = createFileRoute('/admin/system/seo/pages')({
  loader: async () => {
    // Ambil daftar rute SEO dari server function
    const pages = (await getPageSeoListFn()) as PageSeo[]
    return { pages }
  },
  component: AdminSeoPagesRoute,
})

function AdminSeoPagesRoute() {
  const { pages } = Route.useLoaderData()

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px]"
            >
              Kontrol Sistem
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Manajer SEO Halaman (Page SEO Manager)
            <Search className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-lg">
            Kustomisasi meta tag, judul, dan deskripsi SEO untuk halaman/rute spesifik.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Navigasi Sistem */}
        <div className="lg:col-span-1 space-y-4">
          <SystemNav />
        </div>

        {/* Kolom Kanan: Daftar Halaman SEO */}
        <div className="lg:col-span-2 space-y-6">
          <PageSeoList initialPages={pages} />
        </div>
      </div>
    </div>
  )
}
