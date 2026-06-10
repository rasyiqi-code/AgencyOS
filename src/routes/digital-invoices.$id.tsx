import { createFileRoute, redirect } from '@tanstack/react-router'
import { prisma } from '@/lib/config/db'
import { getSystemSettings } from '@/src/server/settings'
import { DigitalInvoiceClientWrapper } from '@/components/invoice/digital-invoice-client-wrapper'
import { CheckoutProgress } from '@/components/checkout/checkout-progress'
import { getCurrentUser } from '@/lib/shared/auth-helpers'
import { paymentGatewayService } from '@/lib/server/payment-gateway-service'
import { Button } from '@/components/ui/button'
import { type SystemSetting } from '@prisma/client'
import { z } from 'zod'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'

const digitalInvoiceSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/digital-invoices/$id')({
  validateSearch: (search) => digitalInvoiceSearchSchema.parse(search),
  loaderDeps: ({ search: { token } }) => ({ token }),
  loader: async ({ params, deps: { token } }) => {
    const { id } = params

    const order = await prisma.digitalOrder.findUnique({
      where: { id },
      include: { product: true, license: true }
    })

    if (!order) {
      throw redirect({ href: '/dashboard' })
    }

    const user = await getCurrentUser()

    // Validasi kepemilikan pesanan jika order.userId diset
    if (order.userId && order.userId !== user?.id) {
      return { authorized: false }
    }

    const orderUser = (order.userId && user && order.userId === user.id) ? {
      name: user.displayName,
      displayName: user.displayName,
      email: user.primaryEmail
    } : null

    const isPaid = order.status === 'PAID'
    const hasActiveGateway = await paymentGatewayService.hasActiveGateway()

    const settings = await getSystemSettings({
      data: [
        'bank_name', 'bank_account', 'bank_holder',
        'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL', 'CONTACT_PHONE', 'CONTACT_TELEGRAM'
      ]
    })

    const getSetting = (key: string) => settings.find((s: SystemSetting) => s.key === key)?.value

    const bankDetails = {
      bank_name: getSetting('bank_name'),
      bank_account: getSetting('bank_account'),
      bank_holder: getSetting('bank_holder')
    }

    const agencySettings = {
      agencyName: getSetting('AGENCY_NAME') || "Agency OS",
      companyName: getSetting('COMPANY_NAME') || "Agency OS",
      address: getSetting('CONTACT_ADDRESS') || "Tech Valley, Cyberjaya\nSelangor, Malaysia 63000",
      email: getSetting('CONTACT_EMAIL') || "billing@crediblemark.com",
      phone: getSetting('CONTACT_PHONE'),
      telegram: getSetting('CONTACT_TELEGRAM')
    }

    // Tentukan step saat ini untuk progress bar
    let currentStep: 1 | 2 | 3 | 4 = 2
    if (isPaid) {
      currentStep = 4
    } else {
      const metadata = order.paymentMetadata as Record<string, unknown>
      const hasInitiatedPayment = metadata && (
        metadata.payment_type || 
        metadata.transaction_id || 
        metadata.status_code || 
        order.status === 'WAITING_VERIFICATION'
      )
      if (hasInitiatedPayment) {
        currentStep = 3
      }
    }

    return {
      authorized: true,
      order,
      isPaid,
      bankDetails,
      agencySettings,
      hasActiveGateway,
      userMethod: orderUser,
      currentStep,
    }
  },
  component: DigitalInvoicePage,
})

function DigitalInvoicePage() {
  const data = Route.useLoaderData()

  if (!data.authorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-zinc-400">Anda tidak memiliki akses ke invoice ini.</p>
          <Button variant="outline" asChild>
            <a href="/dashboard">Ke Dashboard</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="no-print contents">
        <SiteHeader />
      </div>
      <main className="flex-1 pt-14 pb-24 text-left w-full selection:bg-lime-500/30">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <CheckoutProgress currentStep={data.currentStep!} />
          <DigitalInvoiceClientWrapper
            order={data.order as any}
            isPaid={data.isPaid!}
            bankDetails={data.bankDetails!}
            agencySettings={data.agencySettings!}
            hasActiveGateway={data.hasActiveGateway!}
            userMethod={data.userMethod}
          />
        </div>
      </main>
      <div className="no-print">
        <SiteFooter />
      </div>
    </div>
  )
}
