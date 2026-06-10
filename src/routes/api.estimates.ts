import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getCurrentUser } from '@/lib/shared/auth-helpers'
import { notifyNewEstimate } from '@/lib/email/admin-notifications'
import { estimateFlow } from '@/src/genkit/flows/estimator'

export const Route = createFileRoute('/api/estimates')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url)
          const limit = parseInt(url.searchParams.get('limit') || '2')
          const cursor = url.searchParams.get('cursor') || undefined

          const estimates = await prisma.estimate.findMany({
            where: {
              prompt: "Instant Quote Calculator"
            },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              totalHours: true,
              totalCost: true,
              createdAt: true,
              complexity: true,
              creatorName: true
            }
          })

          const nextCursor = estimates.length === limit ? estimates[estimates.length - 1].id : undefined

          return json({
            items: estimates,
            nextCursor
          })
        } catch (error) {
          console.error("GET /api/estimates error:", error)
          return json({ error: "Failed to fetch estimates" }, { status: 500 })
        }
      },

      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const user = await getCurrentUser()
          const userId = user?.id
          const creatorName = user?.displayName || user?.primaryEmail?.split('@')[0] || "Anonymous"

          // Manual Mode (dari Calculator/Formulir Input Biasa)
          if (body.type === 'manual') {
            const { title, summary, complexity, screens, apis, totalHours, totalCost, prompt } = body.data

            const estimate = await prisma.estimate.create({
              data: {
                prompt: prompt || "Manual Estimate",
                title,
                summary,
                complexity,
                screens: screens || [],
                apis: apis || [],
                totalHours: Number(totalHours) || 0,
                totalCost: Number(totalCost) || 0,
                status: 'draft',
                userId,
                creatorName
              }
            })
            return json({ id: estimate.id })
          }

          // AI Mode (Genkit)
          const { prompt } = body

          if (!prompt) {
            return json({ error: "Prompt is required" }, { status: 400 })
          }

          // Jalankan Genkit Flow
          const result = await estimateFlow(prompt)

          // Simpan hasil estimasi ke database
          const estimate = await prisma.estimate.create({
            data: {
              prompt,
              title: result.title,
              summary: result.summary,
              complexity: result.complexity,
              screens: result.screens || [],
              apis: result.apis || [],
              totalHours: Number(result.totalHours) || 0,
              totalCost: Number(result.totalCost) || 0,
              userId,
              creatorName
            }
          })

          // Kirim notifikasi admin secara asynchronous
          notifyNewEstimate({
            id: estimate.id,
            title: estimate.title,
            totalCost: estimate.totalCost,
            creatorName: estimate.creatorName || "Anonymous"
          }).catch(err => console.error("Failed to send admin notification:", err))

          return json({ id: estimate.id })
        } catch (error: unknown) {
          console.error("Estimate generation error:", error)
          const errorMessage = error instanceof Error ? error.message : "Failed to generate estimate"
          return json({ error: errorMessage }, { status: 500 })
        }
      }
    }
  }
})
