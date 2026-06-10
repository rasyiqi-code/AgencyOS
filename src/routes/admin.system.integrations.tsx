import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Link2, Github, Globe, CheckCircle2, XCircle, Unlink } from 'lucide-react'
import { SystemNav } from '@/components/admin/system-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSystemIntegrationsFn, disconnectIntegrationFn } from '@/src/server/settings'
import { useState } from 'react'
import { toast } from 'sonner'

interface Integration {
  id: string
  provider: string
  accessToken: string
  accountName: string | null
  accountId: string | null
  isActive: boolean
  metadata: any
}

// Rute TanStack Start untuk integrasi sistem agensi
export const Route = createFileRoute('/admin/system/integrations')({
  loader: async () => {
    // Ambil data seluruh integrasi yang terdaftar
    const integrations = (await getSystemIntegrationsFn()) as Integration[]
    return { integrations }
  },
  component: AdminIntegrationsRoute,
})

function AdminIntegrationsRoute() {
  const { integrations } = Route.useLoaderData()
  const router = useRouter()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const github = integrations.find((i) => i.provider === 'github')
  const vercel = integrations.find((i) => i.provider === 'vercel')

  // Handler untuk memutuskan koneksi integrasi (disconnect)
  const handleDisconnect = async (provider: string) => {
    setLoadingProvider(provider)
    try {
      await disconnectIntegrationFn({ data: { provider } })
      toast.success(`Integrasi ${provider} berhasil diputus`)
      router.invalidate()
    } catch (error) {
      console.error(error)
      toast.error(`Gagal memutuskan integrasi ${provider}`)
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="w-full py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Integrasi Sistem
          <Link2 className="w-6 h-6 text-zinc-600" />
        </h1>
        <p className="text-zinc-400 mt-1.5 text-sm max-w-lg">
          Hubungkan GitHub dan Vercel untuk mengaktifkan alur kerja otomatis dan pemantauan deployment.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Navigasi Sistem */}
        <div className="lg:col-span-1">
          <SystemNav />
        </div>

        {/* Kolom Kanan: Integrasi Provider */}
        <div className="lg:col-span-2 space-y-6">
          {/* GitHub Integration */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-white/5">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">GitHub</h3>
                  <p className="text-xs text-zinc-500">Aktivitas Repositori & Commit</p>
                </div>
              </div>
              {github?.isActive ? (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Terhubung
                </Badge>
              ) : (
                <Badge variant="outline" className="text-zinc-500 border-zinc-800 text-xs">
                  <XCircle className="w-3 h-3 mr-1" /> Terputus
                </Badge>
              )}
            </div>

            {github?.isActive ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {github.metadata && typeof github.metadata.avatar_url === 'string' && (
                      <img
                        src={github.metadata.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full border border-white/10"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{github.accountName}</p>
                      <p className="text-[10px] text-zinc-500 font-mono italic">
                        ID: {github.accountId}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingProvider === 'github'}
                    onClick={() => handleDisconnect('github')}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20 gap-2 text-xs"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {loadingProvider === 'github' ? 'Memutus...' : 'Putuskan'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <a href="/api/integrations/github/authorize">
                  <Button className="w-full bg-white text-black hover:bg-zinc-200 gap-2 font-medium text-xs">
                    <Link2 className="w-4 h-4" /> Hubungkan Akun GitHub
                  </Button>
                </a>
                <p className="text-[10px] text-zinc-600 mt-3 text-center">
                  Memerlukan izin repo dan read:user dari GitHub.
                </p>
              </div>
            )}
          </div>

          {/* Vercel Integration */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-white/5">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Vercel</h3>
                  <p className="text-xs text-zinc-500">Kontrol Deployment & Webhook</p>
                </div>
              </div>
              {vercel?.isActive ? (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Terhubung
                </Badge>
              ) : (
                <Badge variant="outline" className="text-zinc-500 border-zinc-800 text-xs">
                  <XCircle className="w-3 h-3 mr-1" /> Terputus
                </Badge>
              )}
            </div>

            {vercel?.isActive ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{vercel.accountName}</p>
                    <p className="text-[10px] text-zinc-500 font-mono italic">
                      {vercel.accountId?.startsWith('team_') ? 'ID Tim' : 'ID Pengguna'}:{' '}
                      {vercel.accountId}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingProvider === 'vercel'}
                    onClick={() => handleDisconnect('vercel')}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20 gap-2 text-xs"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {loadingProvider === 'vercel' ? 'Memutus...' : 'Putuskan'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <a href="/api/integrations/vercel/authorize">
                  <Button className="w-full bg-sky-500 text-white hover:bg-sky-600 gap-2 font-medium text-xs">
                    <Link2 className="w-4 h-4" /> Hubungkan Akun Vercel
                  </Button>
                </a>
                <p className="text-[10px] text-zinc-600 mt-3 text-center">
                  Mengaktifkan trigger deployment otomatis via API.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-blue-950/10 border border-blue-500/10">
            <p className="text-xs text-blue-400/80 leading-relaxed">
              <strong>Catatan:</strong> Integrasi ini berlaku untuk seluruh sistem. Menghubungkan akun
              akan memungkinkan sistem menggunakan kredensial tersebut untuk semua proyek yang dipantau.
              Token disimpan dengan aman dan dienkripsi saat transit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
