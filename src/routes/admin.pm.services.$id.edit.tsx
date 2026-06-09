import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/config/db'
import { EditServiceForm, type ServiceData } from '@/components/admin/pm/services/edit-form'

export const Route = createFileRoute('/admin/pm/services/$id/edit')({
  loader: async ({ params: { id } }) => {
    const [service, categoryData] = await Promise.all([
      prisma.service.findUnique({
        where: { id }
      }),
      prisma.service.findMany({
        select: { category: true },
        distinct: ['category']
      })
    ])

    if (!service) {
      throw new Error('Service not found')
    }

    const features = Array.isArray(service.features) ? (service.features as string[]) : []
    const features_id = Array.isArray((service as Record<string, unknown>).features_id) ? ((service as Record<string, unknown>).features_id as string[]) : []

    const categories = Array.from(new Set(
      categoryData
        .map(s => s.category)
        .filter((c): c is string => !!c && c !== 'Uncategorized')
    )).sort()

    return {
      service: service as unknown as ServiceData,
      features,
      features_id,
      categories
    }
  },
  component: AdminEditServiceRoute,
})

function AdminEditServiceRoute() {
  const { service, features, features_id, categories } = Route.useLoaderData()

  return (
    <div className="w-full py-6">
      <EditServiceForm
        service={service}
        features={features}
        features_id={features_id}
        categories={categories}
      />
    </div>
  )
}
