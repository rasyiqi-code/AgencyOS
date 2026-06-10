import { createFileRoute } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { SystemNav } from '@/components/admin/system-nav'
import { ResendConfigForm } from '@/components/admin/system/resend-config-form'
import { getSystemSettings } from '@/src/server/settings'

// Definisi rute halaman konfigurasi email admin
export const Route = createFileRoute('/admin/system/email')({
  loader: async () => {
    // Mengambil konfigurasi kunci API Resend dan alamat email tujuan admin
    const settings = await getSystemSettings({
      data: ["RESEND_API_KEY", "ADMIN_EMAIL_TARGET"],
    })
    return { settings }
  },
  component: AdminEmailRoute,
})

function AdminEmailRoute() {
  const { settings } = Route.useLoaderData()
  const resendApiKey = settings.find(s => s.key === "RESEND_API_KEY")?.value || null
  const adminTargetEmail = settings.find(s => s.key === "ADMIN_EMAIL_TARGET")?.value || null

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Email Service
            <Mail className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm max-w-lg">
            Configure email delivery settings and provider integrations.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Navigasi Sistem */}
        <div className="lg:col-span-1 space-y-4">
          <SystemNav />
        </div>

        {/* Kolom Kanan: Formulir Konfigurasi */}
        <div className="lg:col-span-2 space-y-6">
          <ResendConfigForm currentKey={resendApiKey} currentTargetEmail={adminTargetEmail} />
        </div>
      </div>
    </div>
  )
}
