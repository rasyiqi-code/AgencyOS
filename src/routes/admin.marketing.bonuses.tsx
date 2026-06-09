import { createFileRoute } from '@tanstack/react-router'
import { BonusesManager } from '@/components/admin/marketing/bonuses-manager'
import { Users } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute('/admin/marketing/bonuses')({
  component: BonusesManagerRoute,
})

function BonusesManagerRoute() {
  return (
    <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-yellow" />
          Customer Bonuses
        </h1>
        <p className="text-zinc-400 mt-1">
          Manage special bonuses and freebies bundled with specific services.
        </p>
      </header>

      <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/10">
        <Suspense fallback={<div className="p-8 text-white text-center">Loading Content...</div>}>
          <BonusesManager />
        </Suspense>
      </div>
    </div>
  )
}
