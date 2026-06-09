import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getCachedUsers } from '@/lib/config/hexclave'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { type StackUser } from '@/lib/shared/types'

async function requireAdmin() {
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Unauthorized')
}

export const getAdminClientsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      await requireAdmin()
      
      let users: StackUser[] = []
      try {
        users = await getCachedUsers() as unknown as StackUser[]
      } catch (error) {
        console.error("Failed to fetch stack users:", error)
      }

      const allProjects = await prisma.project.findMany({
        select: {
          userId: true,
          title: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Format data agar serializable
      const formattedClients = (users || []).map((user: StackUser) => {
        const userProjects = allProjects.filter(p => p.userId === user.id)
        return {
          id: user.id,
          displayName: user.displayName || 'No Name',
          email: user.primaryEmail,
          profileImageUrl: user.profileImageUrl || null,
          createdAt: (user.signedUpAt || user.createdAt || null),
          lastActiveAt: (user.lastActiveAt || null),
          projects: userProjects.map(p => ({ title: p.title, status: p.status })),
        }
      })

      return { success: true, clients: JSON.parse(JSON.stringify(formattedClients)), totalClients: users.length }
    } catch (error) {
      return { success: false, error: (error as Error).message, clients: [], totalClients: 0 }
    }
  })
