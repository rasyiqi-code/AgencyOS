import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getCachedUsers, hexclaveServerApp } from '@/lib/config/hexclave'
import { getCurrentUser } from '@/lib/shared/auth-helpers'
import { type StackUser } from '@/lib/shared/types'
import { z } from 'zod'
import { grantPermission, revokePermission } from '@/lib/server/admin-team'

// Helper untuk validasi bahwa user saat ini adalah admin/super-admin
async function requireSuperAdmin() {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error('Unauthorized')
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  const superAdminId = process.env.SUPER_ADMIN_ID
  const isSuperAdmin = (currentUser.primaryEmail && adminEmails.includes(currentUser.primaryEmail)) || currentUser.id === superAdminId
  
  if (!isSuperAdmin) {
    throw new Error('Forbidden')
  }
  return currentUser
}

export const getAdminTeamFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const currentUser = await requireSuperAdmin()

      let users: StackUser[] = []
      try {
        users = await getCachedUsers() as unknown as StackUser[]
      } catch (error) {
        console.error("Failed to fetch users:", error)
      }

      const permissions = await prisma.userPermission.findMany()
      const squadProfiles = await prisma.squadProfile.findMany()

      const teamMembers = users.map(user => {
        const userPerms = permissions.filter(p => p.userId === user.id)
        const userProfile = squadProfiles.find(p => p.userId === user.id)
        return {
          id: user.id,
          email: user.primaryEmail || '',
          displayName: user.displayName || 'No Name',
          profileImageUrl: user.profileImageUrl || null,
          isPm: userPerms.some(p => p.key === 'manage_projects'),
          isFinance: userPerms.some(p => p.key === 'manage_billing'),
          isDeveloper: !!userProfile && userProfile.status === 'vetted',
        }
      })

      return {
        success: true,
        teamMembers: JSON.parse(JSON.stringify(teamMembers)),
        currentUserId: currentUser.id
      }
    } catch (error) {
      return { success: false, error: (error as Error).message, teamMembers: [], currentUserId: null }
    }
  })

const manageTeamPermissionSchema = z.object({
  userId: z.string(),
  email: z.string(),
  key: z.string(),
  action: z.enum(['grant', 'revoke'])
})

export const manageTeamPermissionFn = createServerFn({ method: 'POST' })
  .validator(manageTeamPermissionSchema)
  .handler(async ({ data }) => {
    try {
      await requireSuperAdmin()
      const { userId, email, key, action } = data
      const currentUser = await getCurrentUser()

      if (currentUser?.id === userId) {
        return { success: false, error: "Admin cannot manage their own permissions to prevent accidental lockout." }
      }

      if (key === 'developer') {
        if (action === 'grant') {
          const existingProfile = await prisma.squadProfile.findUnique({
            where: { userId }
          })

          if (existingProfile) {
            await prisma.squadProfile.update({
              where: { userId },
              data: { status: 'vetted' }
            })
          } else {
            let targetName = email.split('@')[0]
            try {
              const targetUser = await hexclaveServerApp.getUser(userId)
              if (targetUser?.displayName) {
                targetName = targetUser.displayName
              }
            } catch {
              console.warn(`[ADMIN_TEAM] Could not fetch user ${userId}, using email as name.`)
            }

            await prisma.squadProfile.create({
              data: {
                userId,
                email,
                name: targetName,
                role: 'engineer',
                yearsOfExp: 0,
                skills: [],
                status: 'vetted'
              }
            })
          }
        } else if (action === 'revoke') {
          await prisma.squadProfile.update({
            where: { userId },
            data: { status: 'rejected' }
          })
        }
      } else {
        if (action === 'grant') {
          await grantPermission(userId, email, key)
        } else if (action === 'revoke') {
          await revokePermission(userId, key)
        } else {
          return { success: false, error: "Invalid action" }
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Admin team action error:", error)
      return { success: false, error: (error as Error).message }
    }
  })
