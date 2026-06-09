import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/view-design/$slug')({
  component: ViewDesign,
})

function ViewDesign() {
  const { slug } = Route.useParams()
  return <div>View Design: {slug}</div>
}
