import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAdminFinanceQuotesFn } from '@/src/server/finance'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, LayoutGrid, List, CheckCircle2 } from 'lucide-react'
import { PriceEditor } from '@/components/admin/finance/price-editor'
import { InvoiceActions } from '@/components/admin/finance/invoice-actions'
import { DeleteQuoteButton } from '@/components/shared/delete-quote-button'
import { QuoteGeneratorForm } from '@/components/admin/finance/quote-generator-form'
import { type Service } from '@prisma/client'

// Loader data types
interface EstimateData {
  id: string
  prompt: string
  title: string
  summary: string
  screens: Record<string, unknown>[]
  apis: Record<string, unknown>[]
  totalHours: number
  totalCost: number
  complexity: string
  status: string
  serviceId: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
  project: {
    id: string
    userId: string
    title: string
    clientName: string | null
    status: string
    totalAmount: number
    subscriptionStatus: string | null
  } | null
  service: {
    id: string
    title: string
    currency: string
  } | null
}

interface QuotesLoaderData {
  estimates: EstimateData[]
  services: {
    id: string
    title: string
    currency: string
    isActive: boolean
  }[]
  availableUsers: {
    id: string
    name: string
    email?: string
  }[]
}

export const Route = createFileRoute('/admin/finance/quotes')({
  loader: async () => {
    return getAdminFinanceQuotesFn()
  },
  component: AdminQuotesRoute,
})

function AdminQuotesRoute() {
  const initialData = Route.useLoaderData() as QuotesLoaderData

  // React Query untuk sinkronisasi state
  const { data } = useQuery<QuotesLoaderData>({
    queryKey: ['admin-finance-quotes'],
    queryFn: () => getAdminFinanceQuotesFn() as Promise<QuotesLoaderData>,
    initialData,
  })

  const isId = true // Bahasa Indonesia

  const estimates = data?.estimates || []
  const services = (data?.services || []) as unknown as Service[]
  const availableUsers = data?.availableUsers || []

  // Mapping map user untuk helper lookup email/name
  const userMap = new Map(availableUsers.map(u => [u.id, u]))

  return (
    <div className="w-full py-6 space-y-8 text-left animate-in fade-in duration-700">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {isId ? 'Penawaran Harga (Quotes)' : 'Quotes (Price Offers)'}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm max-w-2xl leading-relaxed">
          {isId 
            ? 'Review dan negosiasi penawaran harga dari calon klien atas layanan Anda.' 
            : 'Review and negotiate price offers from prospective clients.'}
        </p>
      </header>

      <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl shadow-black/50 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="bg-brand-yellow/10 px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-yellow/20 rounded-lg">
              <Plus className="w-4 h-4 text-brand-yellow" />
            </div>
            <span className="text-xs sm:text-sm font-black text-brand-yellow uppercase tracking-[0.2em]">
              {isId ? 'GENERATOR PENAWARAN' : 'QUOTE GENERATOR'}
            </span>
          </div>
        </div>
        <CardContent className="p-4 sm:p-8 relative z-10">
          <QuoteGeneratorForm
            services={services}
            availableUsers={availableUsers}
            translations={{
              selectServiceLabel: isId ? 'Pilih Layanan' : 'Select Service',
              selectService: isId ? 'Pilih layanan...' : 'Select a service...',
              selectClientLabel: isId ? 'Pilih Klien' : 'Select Client',
              displayNameLabel: isId ? 'Nama Tampilan' : 'Display Name',
              emailLabel: isId ? 'Email / Kontak' : 'Email / Contact',
              priceLabel: isId ? 'Harga Penawaran' : 'Offer Price',
              generateButton: isId ? 'Generate Quote' : 'Generate Quote'
            }}
          />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <List className="w-5 h-5 text-brand-yellow" />
              {isId ? 'Daftar Penawaran Aktif' : 'Active Quotes List'}
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm">
              {isId ? 'Kelola semua penawaran harga yang telah dikirim ke klien.' : 'Manage all generated quotes sent to clients.'}
            </p>
          </div>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {estimates.length === 0 && (
            <div className="text-center py-12 bg-zinc-900/40 backdrop-blur-md border border-dashed border-zinc-800 rounded-3xl text-zinc-500">
              {isId ? 'Belum ada data penawaran.' : 'No quotes generated yet.'}
            </div>
          )}
          {estimates.map((est) => {
            const clientProfile = est.project?.userId ? userMap.get(est.project.userId) : null
            const displayName = est.project?.clientName && est.project.clientName !== "Client"
              ? est.project.clientName
              : (clientProfile?.name || est.project?.clientName || "Unknown Client")

            return (
              <div key={est.id} className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-5 space-y-4 relative overflow-hidden group active:scale-[0.98] transition-transform">
                <div className="absolute top-0 right-0 p-4">
                  <DeleteQuoteButton estimateId={est.id} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">ID: #{est.id.slice(-8).toUpperCase()}</span>
                  <h3 className="text-white font-bold text-lg truncate pr-10">{displayName}</h3>
                  <p className="text-zinc-400 text-xs">{est.service?.title}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/30">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Total Price</span>
                    <PriceEditor
                      estimateId={est.id}
                      projectId={est.project?.id || null}
                      initialPrice={est.totalCost}
                      currency={est.service?.currency || 'IDR'}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <InvoiceActions
                      estimateId={est.id}
                      hasEmail={!!(clientProfile?.email && clientProfile.email !== 'N/A')}
                      clientName={displayName}
                      serviceTitle={est.service?.title}
                      amount={est.totalCost}
                      currency={est.service?.currency || 'IDR'}
                    />
                    {est.status === 'paid' && (
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full uppercase border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {isId ? 'Lunas' : 'Paid'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View Table */}
        <Card className="hidden sm:block bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 rounded-3xl relative">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="z-20 bg-zinc-900/90 backdrop-blur-md border-zinc-800/50">
                  <TableRow className="border-zinc-800/50 hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">Order ID</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">{isId ? 'Klien' : 'Client'}</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">{isId ? 'Layanan' : 'Service'}</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6 text-right">{isId ? 'Harga Total' : 'Total Price'}</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">Invoice</TableHead>
                    <TableHead className="text-center text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimates.length === 0 && (
                    <TableRow className="border-zinc-800/50">
                      <TableCell colSpan={6} className="text-center py-20 text-zinc-500">
                        <div className="flex flex-col items-center gap-2">
                          <LayoutGrid className="w-10 h-10 opacity-20" />
                          <p>{isId ? 'Belum ada data penawaran.' : 'No quotes found.'}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {estimates.map((est) => {
                    const clientProfile = est.project?.userId ? userMap.get(est.project.userId) : null
                    const displayName = est.project?.clientName && est.project.clientName !== "Client"
                      ? est.project.clientName
                      : (clientProfile?.name || est.project?.clientName || "Unknown Client")

                    return (
                      <TableRow key={est.id} className="border-zinc-800/50 hover:bg-white/[0.03] transition-colors group">
                        <TableCell className="py-4 px-6 font-mono text-[11px] text-zinc-500">
                          #{est.id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="font-bold text-white text-sm tracking-tight group-hover:text-brand-yellow transition-colors">{displayName}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-zinc-400 text-sm italic">
                          {est.service?.title}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <PriceEditor
                            estimateId={est.id}
                            projectId={est.project?.id || null}
                            initialPrice={est.totalCost}
                            currency={est.service?.currency || 'IDR'}
                          />
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <InvoiceActions
                              estimateId={est.id}
                              hasEmail={!!(clientProfile?.email && clientProfile.email !== 'N/A')}
                              clientName={displayName}
                              serviceTitle={est.service?.title}
                              amount={est.totalCost}
                              currency={est.service?.currency || 'IDR'}
                            />
                            {est.status === 'paid' && (
                              <div className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full uppercase border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                {isId ? 'Lunas' : 'Paid'}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <DeleteQuoteButton estimateId={est.id} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
