import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/affiliate')({
  component: AffiliateLayout,
})

function AffiliateLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <main className="p-4"><div className="text-white">Affiliate Layout</div></main>
    </div>
  )
}
