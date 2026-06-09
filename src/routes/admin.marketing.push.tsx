import { createFileRoute } from '@tanstack/react-router'
import { PushManager } from '@/components/admin/marketing/push-manager'
import { Users } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute('/admin/marketing/push')({
  component: PushManagerRoute,
})

function PushManagerRoute() {
  return (
    <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-yellow" />
          Push Notification Center
        </h1>
        <p className="text-zinc-400 mt-1">
          Broadcast web push notifications to registered subscribers.
        </p>
      </header>

      <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Content...</div>}>
          <PushManager />
        </Suspense>
      </div>
    </div>
  )
}
