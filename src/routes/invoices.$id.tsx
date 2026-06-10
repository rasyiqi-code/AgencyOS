import { createFileRoute, redirect } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getSystemSettings } from '@/src/server/settings'
import { InvoiceClientWrapper } from '@/components/invoice/invoice-client-wrapper'
import { CheckoutProgress } from '@/components/checkout/checkout-progress'
import { type ExtendedEstimate } from '@/lib/shared/types'
import { type SystemSetting } from '@prisma/client'
import { getCurrentUser } from '@/lib/shared/auth-helpers'
import { paymentGatewayService } from '@/lib/server/payment-gateway-service'
import { paymentService } from '@/lib/server/payment-service'
import { type InvoiceOrder } from '@/types/payment'
import { z } from 'zod'

const invoiceSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/invoices/$id')({
  validateSearch: (search) => invoiceSearchSchema.parse(search),
  loaderDeps: ({ search: { token } }) => ({ token }),
  loader: async ({ params, deps: { token } }) => {
    const { id } = params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            service: true,
            estimate: {
              include: { service: true }
            }
          }
        }
      }
    })

    if (!order) {
      throw redirect({ href: '/dashboard' })
    }

    const user = await getCurrentUser()
    const isOwner = user?.id === order.userId
    const isAuthorized = isOwner || (token && token === order.snapToken)

    if (!isAuthorized) {
      if (!user) {
        throw redirect({
          href: `/handler/sign-in?callbackUrl=${encodeURIComponent(`/invoices/${id}${token ? `?token=${token}` : ''}`)}`
        })
      }
      return { authorized: false }
    }

    const isPaid = order.status === 'settled' || order.status === 'paid'
    const estimateData = order.project?.estimate

    if (!estimateData) {
      return { authorized: true, error: "Invoice data incomplete" }
    }

    const extendedEstimate: ExtendedEstimate = {
      ...estimateData,
      screens: (estimateData.screens as unknown) as ExtendedEstimate['screens'],
      apis: (estimateData.apis as unknown) as ExtendedEstimate['apis'],
      service: estimateData.service
    }

    if (extendedEstimate.service?.currency === 'IDR') {
      const rate = (order.exchangeRate && order.exchangeRate > 1)
        ? order.exchangeRate
        : (await paymentService.convertToIDR(1)).rate

      const isLegacyMismatched = extendedEstimate.totalCost < 5000

      if (rate > 0) {
        if (!isLegacyMismatched) {
          extendedEstimate.totalCost = extendedEstimate.totalCost / rate
          if (extendedEstimate.service) {
            extendedEstimate.service.price = extendedEstimate.service.price / rate
          }
        }

        if (!order.exchangeRate || order.exchangeRate <= 1) {
          (order as Record<string, unknown>).exchangeRate = rate
        }

        if (extendedEstimate.service) {
          extendedEstimate.service.currency = 'USD'
        }
      }
    }

    const isOffline = order.userId === 'OFFLINE' || !!order.project?.clientName

    const userData = {
      displayName: order.project?.clientName || (isOwner && !isOffline ? user?.displayName : null) || "Valued Client",
      email: (isOwner && !isOffline ? user?.primaryEmail : null) || "", 
    }

    const [settings, gatewayStatus] = await Promise.all([
      getSystemSettings({
        data: ['bank_name', 'bank_account', 'bank_holder', 'manual_payment_active', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL', 'CONTACT_PHONE', 'CONTACT_TELEGRAM']
      }),
      paymentGatewayService.getGatewayStatus()
    ])
    const hasActiveGateway = gatewayStatus.midtrans || gatewayStatus.creem
    const getSetting = (key: string) => settings.find((s: SystemSetting) => s.key === key)?.value

    const isManualActive = getSetting('manual_payment_active') === 'true'
    const bankDetails = isManualActive ? {
      bank_name: getSetting('bank_name'),
      bank_account: getSetting('bank_account'),
      bank_holder: getSetting('bank_holder')
    } : undefined

    const agencySettings = {
      agencyName: getSetting('AGENCY_NAME') || "Agency OS",
      companyName: getSetting('COMPANY_NAME') || "Agency OS",
      address: getSetting('CONTACT_ADDRESS') || "Tech Valley, Cyberjaya\nSelangor, Malaysia 63000",
      email: getSetting('CONTACT_EMAIL') || "billing@crediblemark.com",
      phone: getSetting('CONTACT_PHONE'),
      telegram: getSetting('CONTACT_TELEGRAM')
    }

    let currentStep: 1 | 2 | 3 | 4 = 2
    if (isPaid) {
      currentStep = 4
    } else {
      const metadata = order.paymentMetadata as Record<string, unknown>
      const hasInitiatedPayment = metadata && (
        metadata.payment_type || 
        metadata.transaction_id || 
        metadata.status_code || 
        order.status === 'waiting_verification' ||
        order.snapToken
      )
      if (hasInitiatedPayment) {
        currentStep = 3
      }
    }

    return {
      authorized: true,
      order,
      estimate: extendedEstimate,
      user: userData,
      isPaid,
      bankDetails,
      agencySettings,
      hasActiveGateway,
      gatewayStatus,
      currentStep,
    }
  },
  component: PublicInvoicePage,
})

function PublicInvoicePage() {
  const data = Route.useLoaderData()

  if (!data.authorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-left w-full">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-zinc-400">You do not have permission to view this invoice.</p>
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-left w-full">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-zinc-400">{data.error}</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black selection:bg-lime-500/30 pb-24 text-left w-full">
      <div className="container mx-auto px-4 py-8 md:py-24 max-w-7xl">
        <CheckoutProgress currentStep={data.currentStep!} />
        <InvoiceClientWrapper
          order={data.order as unknown as InvoiceOrder}
          estimate={data.estimate!}
          user={data.user!}
          isPaid={data.isPaid!}
          bankDetails={data.bankDetails}
          agencySettings={data.agencySettings!}
          hasActiveGateway={data.hasActiveGateway!}
          gatewayStatus={data.gatewayStatus!}
        />
      </div>
    </div>
  )
}
