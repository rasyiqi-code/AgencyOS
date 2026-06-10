import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { Prisma } from '@prisma/client'
import { ServiceAddon } from '@/lib/shared/types'
import { getCurrentUser } from '@/lib/shared/auth-helpers'
import { paymentService } from '@/lib/server/payment-service'
import { validateCoupon, applyCoupon } from '@/lib/server/marketing'
import { secureRandomInt } from '@/lib/utils/crypto'

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const debugSteps: string[] = []
        try {
          debugSteps.push("Starting checkout")
          const user = await getCurrentUser()
          if (!user) {
            return json({ error: "Unauthorized" }, { status: 401 })
          }
          debugSteps.push("User authenticated: " + user.id)

          const body = await request.json()
          const { projectId, estimateId, paymentType = "FULL", appliedCoupon, currency = "USD", selectedAddons = [] } = body
          debugSteps.push(`Request parsed. Project: ${projectId}, Estimate: ${estimateId}, Type: ${paymentType}`)

          if (!projectId && !estimateId) {
            return json({ error: "Missing required fields" }, { status: 400 })
          }

          let dbAmount = 0
          let finalProjectId = projectId
          let projectTotalAmount = 0

          // If no projectId but we have estimateId, find or create the project
          if (!finalProjectId && estimateId) {
            debugSteps.push("Looking up estimate")
            const estimate = await prisma.estimate.findUnique({
              where: { id: estimateId },
              include: { project: true, service: true }
            })

            if (!estimate) {
              return json({ error: "Estimate not found" }, { status: 404 })
            }
            debugSteps.push("Estimate found")

            let currentTotalCost = estimate.totalCost
            let currentSummary = estimate.summary

            // Handle dynamically selected addons from checkout page
            if (estimate.service) {
              const basePrice = estimate.service.price
              const addonsMarker = "\n\nAdd-ons Selected at Checkout:"
              const baseSummary = estimate.summary.includes(addonsMarker) 
                ? estimate.summary.substring(0, estimate.summary.indexOf(addonsMarker))
                : estimate.summary
              
              let addonsTotal = 0
              let addonsSummaryText = ""

              if (selectedAddons && selectedAddons.length > 0) {
                addonsSummaryText = addonsMarker;
                (selectedAddons as ServiceAddon[]).forEach((addon) => {
                  addonsTotal += addon.price
                  const currencySymbol = addon.currency === 'IDR' ? 'Rp' : '$'
                  addonsSummaryText += `\n- + ${addon.name} (${currencySymbol}${addon.price} ${addon.interval === "monthly" ? "Monthly" : addon.interval === "yearly" ? "Yearly" : "One-time"})`
                })
              }

              currentTotalCost = basePrice + addonsTotal
              currentSummary = baseSummary + addonsSummaryText
              
              await prisma.estimate.update({
                where: { id: estimate.id },
                data: {
                  totalCost: currentTotalCost,
                  summary: currentSummary
                }
              })
              
              if (estimate.project) {
                await prisma.project.update({
                  where: { id: estimate.project.id },
                  data: {
                    totalAmount: currentTotalCost,
                    description: currentSummary
                  }
                })
              }
            }

            dbAmount = currentTotalCost

            if (estimate.service?.currency === 'IDR') {
              const { rate } = await paymentService.convertToIDR(1)
              dbAmount = dbAmount / rate
            }

            projectTotalAmount = dbAmount

            if (estimate.project) {
              finalProjectId = estimate.project.id
            } else {
              debugSteps.push("Creating new project")
              const newProject = await prisma.project.create({
                data: {
                  userId: user.id,
                  clientName: user.displayName || user.primaryEmail || "Unnamed Client",
                  title: estimate.title,
                  description: estimate.summary,
                  spec: JSON.stringify({ screens: estimate.screens, apis: estimate.apis }, null, 2),
                  status: "pending_payment",
                  estimateId: estimateId,
                  totalAmount: projectTotalAmount,
                }
              })
              finalProjectId = newProject.id
            }
          } else if (finalProjectId) {
            debugSteps.push("Looking up existing project")
            const project = await prisma.project.findUnique({
              where: { id: finalProjectId },
              include: { estimate: { include: { service: true } }, service: true }
            })

            if (!project) {
              return json({ error: "Project not found" }, { status: 404 })
            }
            debugSteps.push("Project found")

            if (project.estimate) {
              dbAmount = project.estimate.totalCost
              if (project.estimate.service?.currency === 'IDR') {
                const { rate } = await paymentService.convertToIDR(1)
                dbAmount = dbAmount / rate
              }
            } else if (project.service) {
              dbAmount = project.service.price
              if (project.service.currency === 'IDR') {
                const { rate } = await paymentService.convertToIDR(1)
                dbAmount = dbAmount / rate
              }
            } else {
              return json({ error: "No pricing source found for this project" }, { status: 400 })
            }
            projectTotalAmount = dbAmount

            if (project.totalAmount === 0 && dbAmount > 0) {
              await prisma.project.update({
                where: { id: finalProjectId },
                data: { totalAmount: dbAmount }
              })
            }
          }

          if (dbAmount <= 0) {
            return json({ error: "Invalid payment amount calculation" }, { status: 400 })
          }

          debugSteps.push("Calculating amount to pay")
          let amountToPay = dbAmount

          if (paymentType === "DP") {
            amountToPay = dbAmount * 0.5
          } else if (paymentType === "REPAYMENT") {
            const project = await prisma.project.findUnique({ where: { id: finalProjectId } })
            const paid = project?.paidAmount || 0
            const total = project?.totalAmount || dbAmount
            amountToPay = total - paid

            if (amountToPay <= 0) {
              return json({ message: "Project already fully paid" }, { status: 400 })
            }
          }

          let validatedCoupon: { code: string; discountType: string; discountValue: number } | null = null
          if (appliedCoupon && typeof appliedCoupon === 'string') {
            const couponResult = await validateCoupon(appliedCoupon)
            if (couponResult.valid && couponResult.coupon) {
              validatedCoupon = couponResult.coupon
              if (validatedCoupon.discountType === 'percentage') {
                amountToPay = amountToPay * (1 - validatedCoupon.discountValue / 100)
              } else {
                amountToPay = Math.max(0, amountToPay - validatedCoupon.discountValue)
              }
              amountToPay = Math.round(amountToPay * 100) / 100
              console.log(`[CHECKOUT] Coupon ${validatedCoupon.code} applied: ${validatedCoupon.discountType} ${validatedCoupon.discountValue} → final $${amountToPay}`)
            } else {
              console.warn(`[CHECKOUT] Invalid coupon code: ${appliedCoupon}`)
            }
          }

          if (amountToPay <= 0) {
            return json({ error: "Invalid payment amount after discount" }, { status: 400 })
          }

          debugSteps.push("Converting currency")
          let finalRate = 1
          let finalIdrAmount = 0
          const { idrAmount: calculatedIdrAmount, rate } = await paymentService.convertToIDR(amountToPay)
          finalRate = rate
          finalIdrAmount = Math.ceil(calculatedIdrAmount)

          console.log(`[CHECKOUT] Type: ${paymentType}, Currency: ${currency}, Amount: ${amountToPay} USD -> ${finalIdrAmount} IDR (Rate: ${finalRate})`)

          debugSteps.push("Checking for existing pending order")
          const existingOrder = await prisma.order.findFirst({
            where: {
              projectId: finalProjectId,
              type: paymentType,
              status: 'pending'
            }
          })

          if (existingOrder && existingOrder.amount === amountToPay) {
            debugSteps.push("Reusing existing order: " + existingOrder.id)
            const orderId = existingOrder.id

            await prisma.project.update({
              where: { id: finalProjectId },
              data: { invoiceId: orderId }
            })

            return json({ orderId })
          } else if (existingOrder) {
            await prisma.order.delete({ where: { id: existingOrder.id } })
          }

          debugSteps.push("Creating new order ID")
          const orderId = `ORDER-${Date.now()}-${secureRandomInt(0, 1000)}`

          const cookieHeader = request.headers.get('cookie') || ''
          const match = cookieHeader.match(/agencyos_affiliate_id=([^;]+)/)
          const affiliateCode = match ? decodeURIComponent(match[1]) : undefined

          const finalOrderAmount = currency === "IDR" ? finalIdrAmount : amountToPay

          debugSteps.push("Saving order to DB")
          await prisma.order.create({
            data: {
              id: orderId,
              amount: finalOrderAmount,
              userId: user.id,
              project: finalProjectId ? { connect: { id: finalProjectId } } : undefined,
              status: "pending",
              type: paymentType,
              currency: currency,
              exchangeRate: finalRate,
              paymentMetadata: {
                ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
                ...(validatedCoupon ? { coupon_code: validatedCoupon.code, coupon_discount: validatedCoupon.discountValue, coupon_type: validatedCoupon.discountType } : {}),
              } as unknown as Prisma.InputJsonValue,
            },
          })

          if (validatedCoupon) {
            await applyCoupon(validatedCoupon.code)
          }

          const updateData = {
            invoiceId: orderId,
            totalAmount: projectTotalAmount
          }

          if (paymentType === 'REPAYMENT' && estimateId) {
            await prisma.estimate.update({
              where: { id: estimateId },
              data: { status: 'pending_payment' }
            })
          }

          await prisma.project.update({
            where: { id: finalProjectId },
            data: updateData
          })

          debugSteps.push("Success")
          return json({ orderId })
        } catch (error) {
          console.error("[MIDTRANS_CHECKOUT_ERROR]", error)
          const isProd = process.env.NODE_ENV === "production"
          return json({
            error: isProd ? "Internal Error" : (error instanceof Error ? error.message : "Internal Error"),
            ...(isProd ? {} : {
              debugSteps,
              details: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
            })
          }, { status: 500 })
        }
      }
    }
  }
})
