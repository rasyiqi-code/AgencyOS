import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/support')({
  component: SupportLayout,
})

function SupportLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <main className="p-4"><div className="text-white">Support Layout</div></main>
    </div>
  )
}
