import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAdminProjectsFn } from '@/src/server/pm'
import { ProjectAccordionList } from '@/components/admin/pm/projects-accordion-list'
import { Layers } from 'lucide-react'
import { z } from 'zod'
import { type ExtendedProject } from '@/lib/shared/types'

// Schema untuk memvalidasi search params
const searchSchema = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/admin/pm/projects')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { query, status } }) => ({ query, status }),
  loader: async ({ deps: { query, status } }) => {
    return getAdminProjectsFn({ data: { query, status } })
  },
  component: AdminProjectsRoute,
})

interface ProjectsLoaderData {
  projects: ExtendedProject[]
  totalCount: number
}

function AdminProjectsRoute() {
  const { query, status } = Route.useSearch()
  const initialData = Route.useLoaderData() as ProjectsLoaderData

  // Sinkronisasi data menggunakan React Query
  const { data } = useQuery<ProjectsLoaderData>({
    queryKey: ['admin-projects', query, status],
    queryFn: () => getAdminProjectsFn({ data: { query, status } }) as Promise<ProjectsLoaderData>,
    initialData: initialData ?? undefined,
  })

  // Memeriksa bahasa berdasarkan cookies di browser jika ada, default ke Indonesia
  // Catatan: Karena kita tidak memiliki i18n penuh di client router saat ini, kita gunakan fallback bilingual
  const isId = true // Default ke Indonesia sesuai petunjuk global user

  const projects = (data?.projects || []) as unknown as ExtendedProject[]
  const totalCount = data?.totalCount || 0

  return (
    <div className="w-full py-6 min-w-0 text-left">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            {isId ? 'Papan Misi' : 'Mission Board'}
            <Layers className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm max-w-lg">
            {isId
              ? 'Ringkasan semua proyek klien, status pengembangan, dan penugasan.'
              : 'Overview of all client projects, development status, and assignments.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {/* Search dan filter dapat dilakukan melalui query params di header atau component */}
      </div>

      <ProjectAccordionList
        data={projects}
        totalCount={totalCount}
        query={query}
        status={status}
      />
    </div>
  )
}
