import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { z } from 'zod'

// Helper otentikasi squad
async function requireSquad() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')

  const squadProfile = await prisma.squadProfile.findUnique({
    where: { userId: user.id }
  })
  if (!squadProfile) throw new Error('Squad profile not found')
  return { user, squadProfile }
}

export const getSquadMissionDetailFn = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    try {
      const { squadProfile } = await requireSquad()

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          briefs: true,
          service: true,
          estimate: true,
          dailyLogs: {
            orderBy: { createdAt: 'desc' }
          },
          feedback: {
            include: { comments: { orderBy: { createdAt: 'asc' } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!project) throw new Error('Project not found')

      const existingApplication = await prisma.missionApplication.findUnique({
        where: {
          missionId_squadId: {
            missionId: project.id,
            squadId: squadProfile.id
          }
        }
      })

      const teamApplications = await prisma.missionApplication.findMany({
        where: {
          missionId: project.id,
          status: { in: ['accepted', 'invited'] }
        },
        include: {
          squad: true
        }
      })

      const team = teamApplications.map(app => ({
        ...app.squad,
        applicationStatus: app.status
      }))

      const isInvited = existingApplication?.status === 'invited'
      const canPost = (existingApplication?.status === 'accepted') || (project.developerId === squadProfile.id)

      return {
        success: true,
        project: JSON.parse(JSON.stringify(project)),
        squadProfile: JSON.parse(JSON.stringify(squadProfile)),
        team: JSON.parse(JSON.stringify(team)),
        isInvited,
        canPost
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        project: null,
        squadProfile: null,
        team: [],
        isInvited: false,
        canPost: false
      }
    }
  })
