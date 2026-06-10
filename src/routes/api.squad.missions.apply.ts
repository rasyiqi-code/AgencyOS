import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/squad/missions/apply')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const { missionId } = await request.json()
          if (!missionId) {
            return json({ error: 'Mission ID is required' }, { status: 400 })
          }

          const squadProfile = await prisma.squadProfile.findUnique({
            where: { userId: user.id }
          })

          if (!squadProfile) {
            return json({ error: 'Squad profile not found' }, { status: 404 })
          }

          const mission = await prisma.project.findUnique({
            where: { id: missionId }
          })

          if (!mission) {
            return json({ error: 'Mission not found' }, { status: 404 })
          }

          if (mission.status !== 'queue') {
            return json({ error: 'Mission is not available for claim' }, { status: 400 })
          }

          const existingApplication = await prisma.missionApplication.findUnique({
            where: {
              missionId_squadId: {
                missionId,
                squadId: squadProfile.id
              }
            }
          })

          if (existingApplication) {
            return json({ error: 'You have already applied for this mission' }, { status: 400 })
          }

          const application = await prisma.missionApplication.create({
            data: {
              missionId,
              squadId: squadProfile.id,
              status: 'pending'
            }
          })

          return json({ success: true, application })
        } catch (error) {
          console.error('Mission application error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
