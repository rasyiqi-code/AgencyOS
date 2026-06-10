import { createFileRoute, useLoaderData, useRouter } from '@tanstack/react-router'
import { getAdminInvoicesFn, markInvoiceAsPaidFn } from '@/src/server/invoices'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, Clock, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const loader = async () => {
  return await getAdminInvoicesFn()
}

export const Route = createFileRoute('/admin/finance/invoices')({
  loader,
  component: AdminInvoicesPage,
})

function AdminInvoicesPage() {
  const estimates = useLoaderData({ from: Route.id })
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleMarkPaid = async (id: string) => {
    setUpdatingId(id)
    try {
      const res = await markInvoiceAsPaidFn({ data: id })
      if (res.success) {
        toast.success('Invoice berhasil ditandai sebagai Lunas!')
        router.invalidate()
      } else {
        toast.error('Gagal memperbarui status invoice')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan tidak terduga')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="w-full py-6">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Invoices & Payments</h1>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-zinc-800">
              <TableRow className="hover:bg-zinc-800/50 border-zinc-800">
                <TableHead className="text-zinc-400">Invoice ID</TableHead>
                <TableHead className="text-zinc-400">Project Title</TableHead>
                <TableHead className="text-zinc-400">Amount</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-right text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                    No active invoices found.
                  </TableCell>
                </TableRow>
              )}
              {estimates.map((est) => (
                <TableRow key={est.id} className="hover:bg-zinc-800/30 border-zinc-800">
                  <TableCell className="font-mono text-xs text-zinc-300">
                    #{est.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium text-white">{est.title}</TableCell>
                  <TableCell className="text-zinc-300">${est.totalCost.toLocaleString()}</TableCell>
                  <TableCell>
                    {est.status === 'paid' ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" /> Paid
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {new Date(est.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`/checkout/${est.id}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </a>
                      {est.status !== 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === est.id}
                          onClick={() => handleMarkPaid(est.id)}
                          className="border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                        >
                          {updatingId === est.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : null}
                          Mark Paid
                        </Button>
                      )}
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
