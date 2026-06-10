import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Cloud, Save } from 'lucide-react'
import { SystemNav } from '@/components/admin/system-nav'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getSystemSettings, saveStorageSettingsFn } from '@/src/server/settings'
import { useState } from 'react'
import { toast } from 'sonner'

// Rute TanStack Start untuk konfigurasi Cloud Storage
export const Route = createFileRoute('/admin/system/storage')({
  loader: async () => {
    // Ambil data pengaturan storage dari server function
    const settings = await getSystemSettings({
      data: [
        'r2_endpoint',
        'r2_access_key_id',
        'r2_secret_access_key',
        'r2_public_domain',
        'r2_bucket_name',
        'cloudflare_account_id',
        'cloudflare_api_token',
      ],
    })
    return { settings }
  },
  component: AdminStorageRoute,
})

function AdminStorageRoute() {
  const { settings } = Route.useLoaderData()
  const router = useRouter()
  const [loadingR2, setLoadingR2] = useState(false)
  const [loadingCf, setLoadingCf] = useState(false)

  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value || ''

  // Handler untuk menyimpan konfigurasi R2
  const handleSaveR2 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingR2(true)
    const formData = new FormData(e.currentTarget)

    try {
      await saveStorageSettingsFn({
        data: {
          r2Endpoint: formData.get('r2_endpoint') as string,
          r2BucketName: formData.get('r2_bucket_name') as string,
          r2AccessKeyId: formData.get('r2_access_key_id') as string,
          r2SecretAccessKey: formData.get('r2_secret_access_key') as string,
          r2PublicDomain: formData.get('r2_public_domain') as string,
        },
      })
      toast.success('Konfigurasi R2 berhasil disimpan')
      router.invalidate()
    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan konfigurasi R2')
    } finally {
      setLoadingR2(false)
    }
  }

  // Handler untuk menyimpan konfigurasi Cloudflare Browser Rendering
  const handleSaveCf = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingCf(true)
    const formData = new FormData(e.currentTarget)

    try {
      await saveStorageSettingsFn({
        data: {
          cloudflareAccountId: formData.get('cloudflare_account_id') as string,
          cloudflareApiToken: formData.get('cloudflare_api_token') as string,
        },
      })
      toast.success('Konfigurasi Browser Rendering berhasil disimpan')
      router.invalidate()
    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan konfigurasi Browser Rendering')
    } finally {
      setLoadingCf(false)
    }
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Cloud Storage
            <Cloud className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-lg">
            Konfigurasi penyimpanan objek yang kompatibel dengan S3 (misal: Cloudflare R2) untuk unggah berkas.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Navigasi Sistem */}
        <div className="lg:col-span-1 space-y-4">
          <SystemNav />
        </div>

        {/* Kolom Kanan: Formulir Pengaturan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Konfigurasi R2 */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  Konfigurasi R2
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Detail koneksi untuk bucket Cloudflare R2.</p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSaveR2} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">R2 Endpoint</label>
                  <Input
                    name="r2_endpoint"
                    defaultValue={getSetting('r2_endpoint')}
                    placeholder="https://<accountid>.r2.cloudflarestorage.com"
                    className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Nama Bucket</label>
                  <Input
                    name="r2_bucket_name"
                    defaultValue={getSetting('r2_bucket_name')}
                    placeholder="agency-os-assets"
                    className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">Access Key ID</label>
                    <Input
                      name="r2_access_key_id"
                      defaultValue={getSetting('r2_access_key_id')}
                      type="password"
                      className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">Secret Access Key</label>
                    <Input
                      name="r2_secret_access_key"
                      defaultValue={getSetting('r2_secret_access_key')}
                      type="password"
                      className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Domain Publik (Public Domain)</label>
                  <Input
                    name="r2_public_domain"
                    defaultValue={getSetting('r2_public_domain')}
                    placeholder="https://pub-....r2.dev"
                    className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-blue-500/20"
                    required
                  />
                  <p className="text-[10px] text-zinc-500">
                    Digunakan untuk menyajikan berkas secara publik. Pastikan domain ini dapat diakses.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loadingR2}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {loadingR2 ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Konfigurasi Browser Rendering */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-orange-500" />
                  Cloudflare Browser Rendering
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Kredensial untuk melakukan bypass X-Frame-Options jika diperlukan.
                </p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSaveCf} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Cloudflare Account ID</label>
                  <Input
                    name="cloudflare_account_id"
                    defaultValue={getSetting('cloudflare_account_id')}
                    placeholder="Masukkan Cloudflare Account ID Anda"
                    className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-orange-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Cloudflare API Token</label>
                  <Input
                    name="cloudflare_api_token"
                    defaultValue={getSetting('cloudflare_api_token')}
                    type="password"
                    placeholder="Masukkan Browser Rendering API Token Anda"
                    className="bg-black/20 border-white/10 text-zinc-200 font-mono text-xs focus-visible:ring-orange-500/20"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loadingCf}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {loadingCf ? 'Menyimpan...' : 'Simpan Kredensial Rendering'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
