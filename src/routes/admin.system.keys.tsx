import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Key, Trash2 } from 'lucide-react'
import { SystemNav } from '@/components/admin/system-nav'
import { AddKeyDialog } from '@/components/admin/add-key-dialog'
import { EditKeyDialog } from '@/components/admin/edit-key-dialog'
import { SaaSKeysClient } from '@/components/admin/system/saas-keys-client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAllSystemKeysFn, toggleAIKeyFn, updateAIKeyFn, deleteAgencyKeyFn } from '@/src/server/keys'
import { toast } from 'sonner'

// Definisi rute untuk halaman brankas kunci API admin
export const Route = createFileRoute('/admin/system/keys')({
  loader: async () => {
    // Mengambil seluruh kunci sistem (AI & agensi)
    const keys = await getAllSystemKeysFn()
    return { keys }
  },
  component: AdminKeysRoute,
})

function AdminKeysRoute() {
  const { keys } = Route.useLoaderData()
  const router = useRouter()

  const aiKeys = keys.filter((k) => k.provider !== "agency-os")
  const agencyKeys = keys.filter((k) => k.provider === "agency-os")

  const handleDelete = async (id: string) => {
    try {
      await deleteAgencyKeyFn({ data: id })
      toast.success("Key deleted successfully")
      router.invalidate()
    } catch {
      toast.error("Failed to delete key")
    }
  }

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await toggleAIKeyFn({ data: { id, isActive: !currentActive } })
      toast.success("Key status updated")
      router.invalidate()
    } catch {
      toast.error("Failed to update key status")
    }
  }

  const handleUpdate = async (id: string, label: string, modelId: string) => {
    await updateAIKeyFn({ data: { id, label, modelId } })
    router.invalidate()
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Secure Vault
            <Key className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm max-w-lg">
            Manage API Keys for AI providers and third-party SaaS integrations.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Navigasi Sistem */}
        <div className="lg:col-span-1 space-y-4">
          <SystemNav />
        </div>

        {/* Kolom Rapat: Tabel Kunci */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-500" />
                  AI Provider Keys
                </h3>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {aiKeys.filter((k) => k.isActive).length} Online
                </Badge>
              </div>
              {/* Tombol Add Key */}
              <AddKeyDialog />
            </div>

            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Label</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Model</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Fingerprint</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">State</TableHead>
                  <TableHead className="text-right text-zinc-400 text-xs uppercase tracking-wider">Ops</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aiKeys.length === 0 && (
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <Key className="w-8 h-8 opacity-20" />
                        <p>AI Vault is empty.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {aiKeys.map((key) => (
                  <TableRow key={key.id} className="hover:bg-white/5 border-white/5">
                    <TableCell className="font-medium text-zinc-200">{key.label}</TableCell>
                    <TableCell className="text-zinc-500 text-xs font-mono">
                      {key.modelId ? (
                        <span className="text-blue-400">{key.modelId}</span>
                      ) : (
                        <span className="opacity-50">Default Pool</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-zinc-500 text-xs">
                      {key.key.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleToggle(key.id, key.isActive)} className="hover:opacity-80 transition-opacity">
                        {key.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-500 border-zinc-700 text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      <EditKeyDialog keyData={key} onSave={handleUpdate} />
                      <Button onClick={() => handleDelete(key.id)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/30">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <SaaSKeysClient initialKeys={agencyKeys} />
        </div>
      </div>
    </div>
  )
}
