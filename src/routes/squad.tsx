import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/squad')({
  component: SquadLayout,
})

function SquadLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <main className="p-4"><div className="text-white">Squad Layout</div></main>
    </div>
  )
}
