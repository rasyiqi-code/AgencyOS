import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { prisma } from '@/lib/config/db'
import { getSystemSettings } from '@/src/server/settings'
import { CheckCircle2, XCircle, ShieldCheck, Calendar, DollarSign, User, Hash } from 'lucide-react'
import { type SystemSetting } from '@prisma/client'

const loader = async ({ params }: { params: { id: string } }) => {
  const { id } = params

  const [rawEstimate, settings] = await Promise.all([
    prisma.estimate.findUnique({
      where: { id },
      include: {
        project: true,
        service: true
      }
    }),
    getSystemSettings({ data: ['AGENCY_NAME'] })
  ])

  const agencyName = settings?.find((s: SystemSetting) => s.key === 'AGENCY_NAME')?.value || 'Agency OS'

  const estimate = rawEstimate ? {
    ...rawEstimate,
    createdAt: rawEstimate.createdAt.toISOString(),
    project: rawEstimate.project ? {
      ...rawEstimate.project,
      createdAt: rawEstimate.project.createdAt.toISOString(),
      updatedAt: rawEstimate.project.updatedAt.toISOString(),
      subscriptionEndsAt: rawEstimate.project.subscriptionEndsAt?.toISOString() || null
    } : null,
    service: rawEstimate.service ? {
      ...rawEstimate.service,
      createdAt: rawEstimate.service.createdAt.toISOString(),
      updatedAt: rawEstimate.service.updatedAt.toISOString()
    } : null
  } : null

  return { estimate, agencyName, id }
}

export const Route = createFileRoute('/verify/$id')({
  loader,
  head: ({ loaderData }) => {
    const id = loaderData?.id || ''
    const shortId = id.slice(-8).toUpperCase()
    return {
      meta: [
        { title: `Verify Invoice #${shortId} | Agency OS` },
        { name: 'description', content: 'Official invoice verification system for Agency OS.' },
      ],
    }
  },
  component: VerifyInvoicePage,
})

function VerifyInvoicePage() {
  const { estimate, agencyName, id } = useLoaderData({ from: Route.id })
  const isVerified = !!estimate

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#312e81,transparent_50%)] opacity-30" />
      
      <div className="relative w-full max-w-xl">
        <div className={`rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl ${isVerified ? 'bg-zinc-900/50' : 'bg-red-950/20'}`}>
          <div className={`h-2 w-full ${isVerified ? 'bg-indigo-500' : 'bg-red-500'}`} />
          
          <div className="p-8 md:p-12 text-center">
            {isVerified && estimate ? (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <ShieldCheck className="w-10 h-10 text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Authenticity Verified</h1>
                <p className="text-zinc-400 mb-8 max-w-sm">
                  This document has been verified as an official invoice issued by {agencyName}.
                </p>
                
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest mb-1">
                      <Hash className="w-3 h-3" />
                      Invoice ID
                    </div>
                    <div className="font-mono text-sm">#{estimate.id.toUpperCase()}</div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest mb-1">
                      <Calendar className="w-3 h-3" />
                      Date Issued
                    </div>
                    <div className="font-medium text-sm">
                      {new Date(estimate.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest mb-1">
                      <User className="w-3 h-3" />
                      Client
                    </div>
                    <div className="font-medium text-sm">{estimate.project?.clientName || 'Valued Client'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest mb-1">
                      <DollarSign className="w-3 h-3" />
                      Total Amount
                    </div>
                    <div className="font-bold text-lg text-indigo-400">
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: estimate.service?.currency || 'USD' 
                      }).format(estimate.totalCost)}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 w-full text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Signed and Encrypted by {agencyName} Trust System
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Verification Failed</h1>
                <p className="text-zinc-400 mb-8 max-w-sm">
                  We could not find any official record for the document ID provided. This document may be invalid or forged.
                </p>
                
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 w-full mb-8 text-left">
                  <div className="text-red-400 text-sm font-medium mb-1 uppercase tracking-widest">Invalid ID</div>
                  <div className="font-mono text-xs opacity-50 break-all">{id}</div>
                </div>
                
                <a href="/contact" className="px-8 py-3 border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                  Contact Support
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-sm rotate-45" />
            </div>
            <span className="font-bold tracking-tight">{agencyName}</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em]">Official Verification Portal</p>
        </div>
      </div>
    </div>
  )
}
