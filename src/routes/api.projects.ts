import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { z } from 'zod'

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

export const Route = createFileRoute('/api/projects')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const query = url.searchParams.get('query')?.trim()
        const status = url.searchParams.get('status')
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const user = await hexclaveServerApp.getUser()
        if (!user) return json({ error: 'Unauthorized' }, { status: 401 })

        let matchedUserIds: string[] = []
        const isUUID = query && /^[0-9a-fA-F-]{36}$/.test(query)

        if (query && isUUID) {
          matchedUserIds = [query]
        }

        const where = {
          AND: [
            { paymentStatus: 'PAID' },
            query ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { userId: { contains: query, mode: 'insensitive' as const } },
                { userId: { equals: query } },
                { description: { contains: query, mode: 'insensitive' as const } },
                { status: { contains: query, mode: 'insensitive' as const } },
                { service: { title: { contains: query, mode: 'insensitive' as const } } },
                ...(matchedUserIds.length > 0 ? [{ userId: { in: matchedUserIds } }] : []),
                { clientName: { contains: query, mode: 'insensitive' as const } },
                { invoiceId: { contains: query, mode: 'insensitive' as const } },
              ]
            } : {},
            (status && status !== 'all') ? { status: { equals: status } } : {},
          ]
        }

        try {
          const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
            select: {
              id: true,
              userId: true,
              title: true,
              description: true,
              status: true,
              createdAt: true,
              invoiceId: true,
              clientName: true,
              service: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          })

          const missingClientNameProjects = projects.filter((p) => !p.clientName && p.userId)
          const uniqueUserIds = Array.from(new Set(missingClientNameProjects.map(p => p.userId)))

          let stackUsers: any[] = []
          if (uniqueUserIds.length > 0) {
            stackUsers = await Promise.all(
              uniqueUserIds.map(async (id) => {
                try {
                  return await hexclaveServerApp.getUser(id)
                } catch (e) {
                  console.error(`Failed to fetch user ${id} in getProjects`, e)
                  return null
                }
              })
            )
          }

          const userMap = new Map(stackUsers.filter(Boolean).map(u => [u!.id, u]))

          const enrichedProjects = projects.map((p) => {
            if (p.clientName) return p
            const u = userMap.get(p.userId)
            return {
              ...p,
              clientName: u?.displayName || u?.primaryEmail || 'Unnamed Client'
            }
          })

          return json(enrichedProjects)
        } catch (error) {
          console.error('Get Projects Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      },
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const jsonBody = await request.json()
          const body = createProjectSchema.parse(jsonBody)

          const project = await prisma.project.create({
            data: {
              userId: user.id,
              clientName: user.displayName || user.primaryEmail || 'Unnamed Client',
              title: body.title,
              description: body.description,
              briefs: {
                create: {
                  content: body.description
                }
              }
            },
            include: {
              briefs: true
            }
          })

          return json(project, { status: 201 })
        } catch (error) {
          if (error instanceof z.ZodError) {
            return json({ error: error.issues }, { status: 400 })
          }

          console.error('Project creation error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
