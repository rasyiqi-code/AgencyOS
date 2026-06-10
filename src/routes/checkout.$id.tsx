import { createFileRoute, redirect } from '@tanstack/react-router'
import { prisma } from '@/lib/config/db'
import { getCurrentUser } from '@/lib/shared/auth-helpers'
import { paymentGatewayService } from '@/lib/server/payment-gateway-service'
import { getBonuses } from '@/lib/server/marketing'
import { getSystemSettings } from '@/src/server/settings'
import { paymentService } from '@/lib/server/payment-service'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { CheckoutProgress } from '@/components/checkout/checkout-progress'
import { CheckoutContent } from '@/components/checkout/checkout-content'
import { DigitalCheckoutContent } from '@/components/checkout/digital-checkout-content'
import { type Bonus, type ExtendedEstimate } from '@/lib/shared/types'
import { type SystemSetting } from '@prisma/client'
import { z } from 'zod'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'

const checkoutSearchSchema = z.object({
  paymentType: z.enum(['FULL', 'DP', 'REPAYMENT']).optional(),
})

export const Route = createFileRoute('/checkout/$id')({
  validateSearch: (search) => checkoutSearchSchema.parse(search),
  beforeLoad: async ({ params }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ 
        href: `/handler/sign-in?callbackUrl=${encodeURIComponent(`/checkout/${params.id}`)}` 
      })
    }
  },
  loaderDeps: ({ search: { paymentType } }) => ({ paymentType }),
  loader: async ({ params, deps: { paymentType } }) => {
    const { id } = params

    const activeRate = await paymentService.getExchangeRate()

    const product = await prisma.product.findUnique({
      where: { id }
    })

    const bonuses = await getBonuses("DIGITAL")

    const bonusesData = bonuses.map((b: Bonus) => ({
      ...b,
      icon: b.icon || "Check",
      value: b.value || "",
      description: b.description || ""
    }))

    const user = await getCurrentUser()
    if (!user) throw redirect({ href: '/handler/sign-in' })

    const userId = user.id
    const userEmail = user.primaryEmail || undefined

    // 1. Jika Product ditemukan dan aktif
    if (product && product.isActive) {
      const productData = {
        id: product.id,
        name: product.name,
        price: product.price,
        purchaseType: (product.purchaseType as "one_time" | "subscription") || "one_time",
        interval: product.interval || undefined,
        description: product.description,
        description_id: product.description_id,
      }

      return {
        type: 'digital',
        product: productData,
        bonuses: bonusesData,
        userId,
        userEmail,
        activeRate,
      }
    }

    // 2. Cari sebagai Service Estimate
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: { service: true, project: true }
    })

    if (!estimate) {
      throw redirect({ href: '/dashboard' })
    }

    const settings = await getSystemSettings({
      data: ['bank_name', 'bank_account', 'bank_holder', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL', 'CONTACT_PHONE', 'CONTACT_TELEGRAM']
    })

    const getSetting = (key: string) => settings.find((s: SystemSetting) => s.key === key)?.value

    const context = ((estimate.prompt === "Instant Quote Calculator" || !estimate.serviceId) ? "CALCULATOR" : "SERVICE") as "SERVICE" | "CALCULATOR"
    const serviceBonuses = await getBonuses(context)

    const hasActiveGateway = await paymentGatewayService.hasActiveGateway()

    const bankDetails = {
      bank_name: getSetting('bank_name'),
      bank_account: getSetting('bank_account'),
      bank_holder: getSetting('bank_holder')
    }

    const agencySettings = {
      agencyName: getSetting('AGENCY_NAME') || "Agency OS",
      companyName: getSetting('COMPANY_NAME') || "Agency OS",
      address: getSetting('CONTACT_ADDRESS') || "Tech Valley\nCyberjaya, Malaysia",
      email: getSetting('CONTACT_EMAIL') || "billing@agencyos.com",
      phone: getSetting('CONTACT_PHONE'),
      telegram: getSetting('CONTACT_TELEGRAM')
    }

    const extendedEstimate: ExtendedEstimate = {
      ...estimate,
      screens: ((estimate.screens as unknown) as ExtendedEstimate['screens']) || [],
      apis: ((estimate.apis as unknown) as ExtendedEstimate['apis']) || [],
      service: estimate.service ? {
        ...estimate.service,
        priceType: (estimate.title.includes("Draft Quote") || estimate.title.startsWith("Quote:")) ? "STARTING_AT" : (estimate.service as Record<string, unknown>).priceType as string
      } : null
    }

    const bonusesDataForEstimate = serviceBonuses.map((b: Bonus) => ({
      ...b,
      icon: b.icon || "Check",
      value: b.value || "",
      description: b.description || ""
    }))

    const userData = {
      displayName: estimate.project?.clientName || user?.displayName || "Valued Client",
      email: "",
    }

    if (estimate.project?.userId) {
      if (estimate.project.userId === 'OFFLINE') {
        const emailMatch = estimate.summary.match(/\(([^)]+)\)/)
        if (emailMatch) {
          userData.email = emailMatch[1]
        }
      } else if (estimate.project.userId !== user?.id) {
        try {
          const owner = await hexclaveServerApp.getUser(estimate.project.userId)
          if (owner) {
            userData.displayName = owner.displayName || owner.primaryEmail || estimate.project.clientName || "Valued Client"
            userData.email = owner.primaryEmail || ""
          }
        } catch (e) {
          console.error("Failed to fetch estimate owner for invoice:", e)
        }
      } else {
        userData.email = user.primaryEmail || ""
      }
    } else {
      userData.email = user?.primaryEmail || ""
    }

    return {
      type: 'service',
      estimate: extendedEstimate,
      bankDetails,
      activeRate,
      bonuses: bonusesDataForEstimate,
      user: userData,
      agencySettings,
      hasActiveGateway,
      paymentType,
      projectPaidAmount: estimate.project?.paidAmount || 0,
      projectTotalAmount: estimate.project?.totalAmount || estimate.totalCost,
      context,
      orderId: estimate.project?.invoiceId,
    }
  },
  component: CheckoutPage,
})

function CheckoutPage() {
  const data = Route.useLoaderData()

  if (data.type === 'digital') {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <div className="no-print contents">
          <SiteHeader />
        </div>
        <main className="flex-1 pt-14 pb-24 text-left w-full selection:bg-lime-500/30">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <CheckoutProgress currentStep={1} />
            <DigitalCheckoutContent
              product={data.product!}
              bonuses={data.bonuses}
              userId={data.userId!}
              userEmail={data.userEmail}
              activeRate={data.activeRate}
            />
          </div>
        </main>
        <div className="no-print">
          <SiteFooter />
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
          <CheckoutProgress currentStep={data.estimate!.status === 'paid' ? 4 : 1} />
          <CheckoutContent
            estimate={data.estimate!}
            bankDetails={data.bankDetails!}
            activeRate={data.activeRate}
            bonuses={data.bonuses}
            user={data.user!}
            agencySettings={data.agencySettings!}
            hasActiveGateway={data.hasActiveGateway!}
            defaultPaymentType={data.paymentType}
            projectPaidAmount={data.projectPaidAmount!}
            projectTotalAmount={data.projectTotalAmount!}
            context={data.context!}
            orderId={data.orderId}
          />
        </div>
      </main>
      <div className="no-print">
        <SiteFooter />
      </div>
    </div>
  )
}
