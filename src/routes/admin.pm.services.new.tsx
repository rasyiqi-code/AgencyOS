import { createFileRoute } from '@tanstack/react-router'
import { getAdminServiceCategoriesFn } from '@/src/server/pm'
import { CreateServiceForm } from '@/components/admin/pm/services/create-form'

export const Route = createFileRoute('/admin/pm/services/new')({
  loader: async () => {
    const services = await getAdminServiceCategoriesFn()

    const categories = Array.from(new Set(
      (services as { category: string | null }[])
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
