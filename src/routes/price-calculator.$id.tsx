import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { getPublicEstimateFn } from '@/src/server/estimates'
import { EstimateViewer } from '@/components/estimate/estimate-viewer'

export const Route = createFileRoute('/price-calculator/$id')({
  loader: async ({ params }) => {
    try {
      const estimate = await getPublicEstimateFn({ data: params.id })
      if (!estimate) {
        throw notFound()
      }
      return { estimate, error: null }
    } catch (err: any) {
      if (err?.message === 'Access Denied') {
        return { estimate: null, error: 'Access Denied' }
      }
      throw notFound()
    }
  },
  component: EstimateResultPage,
})

function EstimateResultPage() {
  const { estimate, error } = Route.useLoaderData()

  if (error === 'Access Denied') {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-400 mb-6">You do not have permission to view this estimate.</p>
        <Link to="/price-calculator" className="text-brand-yellow hover:underline">
          Create your own estimate
        </Link>
      </main>
    )
  }

  if (!estimate) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-2">Not Found</h1>
        <p className="text-zinc-400 mb-6">Estimate not found.</p>
        <Link to="/price-calculator" className="text-brand-yellow hover:underline">
          Create your own estimate
        </Link>
      </main>
    )
  }

  // Konversi schema JSON agar sesuai dengan properti tipe EstimateViewer
  const sanitizedEstimate = {
    ...estimate,
    screens: (estimate.screens || []).map((s: any) => ({
      title: s.title || '',
      hours: Number(s.hours) || 0,
      description: s.description || '',
    })),
    apis: (estimate.apis || []).map((a: any) => ({
      title: a.title || '',
      hours: Number(a.hours) || 0,
      description: a.description || '',
    })),
  }

  return (
    <main className="min-h-screen bg-black selection:bg-blue-500/30 pb-24">
      <div className="container mx-auto px-4 pt-4 pb-20">
        <EstimateViewer estimate={sanitizedEstimate} />
      </div>
    </main>
  )
}
