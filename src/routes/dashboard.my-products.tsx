import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/my-products')({
  component: DashboardMyProducts,
})

function DashboardMyProducts() {
  return <div>My Products</div>
}
