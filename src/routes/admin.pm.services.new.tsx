import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/config/db'
import { CreateServiceForm } from '@/components/admin/pm/services/create-form'

export const Route = createFileRoute('/admin/pm/services/new')({
  loader: async () => {
    // Mengambil kategori unik yang ada di database
    const services = await prisma.service.findMany({
      select: { category: true },
      distinct: ['category']
    })

    const categories = Array.from(new Set(
      services
        .map(s => s.category)
        .filter((c): c is string => !!c && c !== 'Uncategorized')
    )).sort()

    return { categories }
  },
  component: AdminNewServiceRoute,
})

function AdminNewServiceRoute() {
  const { categories } = Route.useLoaderData()

  return (
    <div className="w-full py-6">
      <CreateServiceForm categories={categories} />
    </div>
  )
}
