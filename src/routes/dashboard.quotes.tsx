import { createFileRoute } from '@tanstack/react-router'
import { getClientQuotesFn } from '@/src/server/client-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight } from "lucide-react"
import { DeleteQuoteButton } from "@/components/shared/delete-quote-button"
import { QuotePriceCell } from "@/components/admin/finance/quote-price-cell"

export const Route = createFileRoute('/dashboard/quotes')({
  loader: async () => {
    return await getClientQuotesFn()
  },
  component: ClientQuotesPage,
})

const dict = {
  id: {
    title: "Penawaran Harga",
    subtitle: "Lihat dan kelola penawaran harga Anda.",
    historyTitle: "Riwayat Penawaran",
    historyDesc: "Daftar penawaran harga yang pernah diajukan.",
    colService: "Layanan",
    colOfferedPrice: "Harga Ditawarkan",
    colAction: "Aksi",
    empty: "Belum ada penawaran harga.",
    pay: "Bayar",
    detail: "Detail"
  },
  en: {
    title: "Quotes",
    subtitle: "View and manage your quotes.",
    historyTitle: "Quote History",
    historyDesc: "List of quotes previously offered.",
    colService: "Service",
    colOfferedPrice: "Offered Price",
    colAction: "Action",
    empty: "No quotes offered yet.",
    pay: "Pay",
    detail: "Detail"
  }
}

interface EstimateWithService {
  id: string
  title: string
  totalCost: number
  status: string
  projectId: string
  createdAt: string
  service?: {
    title: string
    currency: string
  } | null
}

function ClientQuotesPage() {
  const result = Route.useLoaderData()
  if (!result || !result.success) {
    return <div className="text-zinc-500 p-8 text-left">Gagal memuat data quotes atau Anda tidak memiliki akses.</div>
  }

  const locale = (result.locale === 'id-ID' || result.locale === 'id') ? 'id' : 'en'
  const t = dict[locale]
  const estimates = result.estimates as EstimateWithService[]

  return (
    <div className="w-full py-2 text-left">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-white text-base">
            {t.historyTitle}
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs font-light">
            {t.historyDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Table>
            <TableHeader className="border-zinc-800">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 h-9 text-xs">{t.colService}</TableHead>
                <TableHead className="text-zinc-400 h-9 text-xs">{t.colOfferedPrice}</TableHead>
                <TableHead className="text-right text-zinc-400 h-9 text-xs">{t.colAction}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.length === 0 && (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={4} className="text-center py-8 text-zinc-500 text-sm">
                    {t.empty}
                  </TableCell>
                </TableRow>
              )}
              {estimates.map((est) => (
                <TableRow key={est.id} className="border-zinc-800 hover:bg-white/5">
                  <TableCell>
                    <div className="font-medium text-white">{est.service?.title || est.title}</div>
                    <div className="text-xs text-zinc-500 font-mono">#{est.id.slice(-8).toUpperCase()}</div>
                  </TableCell>
                  <TableCell className="text-emerald-400 font-bold">
                    <QuotePriceCell
                      amount={est.totalCost}
                      baseCurrency={(est.service?.currency as "USD" | "IDR") || 'USD'}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Pastikan DeleteQuoteButton menerima userId yang sesuai jika dibutuhkan */}
                      <DeleteQuoteButton estimateId={est.id} userId="" />
                      <a href={`/checkout/${est.id}`}>
                        <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8">
                          {est.status === 'pending_payment' ? t.pay : t.detail}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
