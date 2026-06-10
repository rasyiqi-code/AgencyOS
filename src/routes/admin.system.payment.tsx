import { createFileRoute } from '@tanstack/react-router'
import { SystemNav } from '@/components/admin/system-nav'
import { PaymentGatewayConfigForm } from '@/components/admin/payment-gateway-config-form'
import { getSystemSettings, getPaymentConfigsFn, updateSystemSettingFn } from '@/src/server/settings'
import { CreditCard, Save, Building, User, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

// Definisi rute untuk halaman konfigurasi pembayaran admin
export const Route = createFileRoute('/admin/system/payment')({
  loader: async () => {
    // Mengambil konfigurasi rekening bank dan gateway pembayaran secara paralel
    const [settings, gatewayConfigs] = await Promise.all([
      getSystemSettings({
        data: ['bank_name', 'bank_account', 'bank_holder', 'manual_payment_active']
      }),
      getPaymentConfigsFn()
    ])
    return { settings, gatewayConfigs }
  },
  component: AdminPaymentRoute,
})

function AdminPaymentRoute() {
  const { settings, gatewayConfigs } = Route.useLoaderData()

  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value || ""

  // State untuk form detail rekening bank manual
  const [bankName, setBankName] = useState(getSetting("bank_name"))
  const [bankAccount, setBankAccount] = useState(getSetting("bank_account"))
  const [bankHolder, setBankHolder] = useState(getSetting("bank_holder"))
  const [manualPaymentActive, setManualPaymentActive] = useState(getSetting("manual_payment_active") === "true")
  const [isSavingBank, setIsSavingBank] = useState(false)

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingBank(true)
    try {
      // Meng-upsert setiap pengaturan bank secara paralel
      await Promise.all([
        updateSystemSettingFn({ data: { key: "bank_name", value: bankName } }),
        updateSystemSettingFn({ data: { key: "bank_account", value: bankAccount } }),
        updateSystemSettingFn({ data: { key: "bank_holder", value: bankHolder } }),
        updateSystemSettingFn({ data: { key: "manual_payment_active", value: manualPaymentActive ? "true" : "false" } }),
      ])
      toast.success("Bank details updated successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save bank details")
    } finally {
      setIsSavingBank(false)
    }
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Payment Details
            <CreditCard className="w-6 h-6 text-zinc-600" />
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-lg">
            Manage bank accounts and billing details displayed on client invoices.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Navigasi Sistem */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <SystemNav />
          </div>
        </div>

        {/* Kolom Kanan: Form Pengaturan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Rekening Bank */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  Bank Account
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Details displayed on client invoices.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                {manualPaymentActive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Inactive</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSaveBank} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      Bank Name
                    </label>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. BCA"
                      className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-emerald-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Account Number
                    </label>
                    <Input
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="e.g. 1234567890"
                      className="bg-black/20 border-white/10 text-zinc-200 font-mono focus-visible:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Account Holder Name
                  </label>
                  <Input
                    value={bankHolder}
                    onChange={(e) => setBankHolder(e.target.value)}
                    placeholder="e.g. PT Agency OS Indonesia"
                    className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-emerald-500/20"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="space-y-0.5">
                    <Label htmlFor="manual_payment_active" className="text-sm font-medium text-white">Manual Transfer Status</Label>
                    <p className="text-xs text-zinc-500">Enable this to show bank details on client invoices.</p>
                  </div>
                  <Switch
                    id="manual_payment_active"
                    checked={manualPaymentActive}
                    onCheckedChange={setManualPaymentActive}
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <Button type="submit" disabled={isSavingBank} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                    {isSavingBank ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Form Payment Gateway */}
          <PaymentGatewayConfigForm initialConfig={gatewayConfigs} />
        </div>
      </div>
    </div>
  )
}
