import { createFileRoute, useRouter } from '@tanstack/react-router'
import { TrendingUp, DollarSign, Save } from 'lucide-react'
import { SystemNav } from '@/components/admin/system-nav'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getPricingConfigFn, savePricingSettingsFn } from '@/src/server/settings'
import { useState } from 'react'
import { toast } from 'sonner'

// Rute TanStack Start untuk konfigurasi Pricing Model AI agensi
export const Route = createFileRoute('/admin/system/pricing')({
  loader: async () => {
    // Ambil konfigurasi pricing dari server function
    const pricing = await getPricingConfigFn()
    return { pricing }
  },
  component: AdminPricingRoute,
})

function AdminPricingRoute() {
  const { pricing } = Route.useLoaderData()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Handler untuk menyimpan model harga pricing agensi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const baseRate = parseFloat(formData.get('base_rate') as string)
    const low = parseFloat(formData.get('mult_low') as string)
    const med = parseFloat(formData.get('mult_med') as string)
    const high = parseFloat(formData.get('mult_high') as string)

    try {
      await savePricingSettingsFn({
        data: {
          baseRate: baseRate || 15,
          multipliers: {
            Low: low || 1.0,
            Medium: med || 1.25,
            High: high || 1.5,
          },
        },
      })
      toast.success('Model harga AI berhasil disimpan')
      router.invalidate()
    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan konfigurasi model harga')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
              Konfigurasi Sistem
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Strategi Harga
            <TrendingUp className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-lg">
            Konfigurasi tarif dasar jam dan pengali kompleksitas AI untuk estimasi proyek otomatis.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Navigasi Sistem */}
        <div className="lg:col-span-1 space-y-4">
          <SystemNav />
        </div>

        {/* Kolom Kanan: Formulir Pricing Model */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-lime-500" />
                  Model Harga AI (AI Pricing Model)
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Atur tarif dasar per jam dan pengali tingkat kompleksitas pengerjaan.
                </p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      Tarif Dasar per Jam (USD)
                    </label>
                    <Input
                      name="base_rate"
                      type="number"
                      step="0.01"
                      defaultValue={pricing.baseRate}
                      className="bg-black/20 border-white/10 text-white font-mono text-lg"
                      required
                    />
                    <p className="text-xs text-zinc-600 mt-1">
                      Tarif standar yang akan digunakan dalam kalkulasi sebelum dikalikan pengali tingkat kesulitan.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-emerald-500 uppercase">
                        Kompleksitas Rendah
                      </label>
                      <Input
                        name="mult_low"
                        type="number"
                        step="0.1"
                        defaultValue={pricing.multipliers.Low}
                        className="bg-black/20 border-white/10 text-white font-mono"
                        required
                      />
                      <span className="text-[10px] text-zinc-500">Pengali (misal: 1.0x)</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-yellow-500 uppercase">
                        Kompleksitas Sedang
                      </label>
                      <Input
                        name="mult_med"
                        type="number"
                        step="0.1"
                        defaultValue={pricing.multipliers.Medium}
                        className="bg-black/20 border-white/10 text-white font-mono"
                        required
                      />
                      <span className="text-[10px] text-zinc-500">Pengali (misal: 1.25x)</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-red-500 uppercase">
                        Kompleksitas Tinggi
                      </label>
                      <Input
                        name="mult_high"
                        type="number"
                        step="0.1"
                        defaultValue={pricing.multipliers.High}
                        className="bg-black/20 border-white/10 text-white font-mono"
                        required
                      />
                      <span className="text-[10px] text-zinc-500">Pengali (misal: 1.5x)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-lime-600 hover:bg-lime-500 text-black font-semibold text-xs flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {loading ? 'Menyimpan...' : 'Simpan Model Harga'}
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
