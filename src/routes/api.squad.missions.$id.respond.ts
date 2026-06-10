import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/squad/missions/$id/respond')({
  server: {
    handlers: {
      POST: async ({ params, request }: { params: { id: string }, request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: missionId } = params
        const { action } = await request.json()

        if (!['accept', 'reject'].includes(action)) {
          return json({ error: 'Invalid action' }, { status: 400 })
        }

        try {
          const squadProfile = await prisma.squadProfile.findUnique({
            where: { userId: user.id }
          })

          if (!squadProfile) {
            return json({ error: 'Profile not found' }, { status: 404 })
          }

          const application = await prisma.missionApplication.findUnique({
            where: {
              missionId_squadId: {
                missionId,
                squadId: squadProfile.id
              }
            }
          })

          if (!application) {
            return json({ error: 'Application not found' }, { status: 404 })
          }

          if (application.status !== 'invited') {
            return json({ error: 'Application is not in invited state' }, { status: 400 })
          }

          if (action === 'accept') {
            await prisma.missionApplication.update({
              where: {
                missionId_squadId: {
                  missionId,
                  squadId: squadProfile.id
                }
              },
              data: { status: 'accepted' }
            })
          } else if (action === 'reject') {
            await prisma.missionApplication.delete({
              where: {
                missionId_squadId: {
                  missionId,
                  squadId: squadProfile.id
                }
              }
            })
          }

          return json({ success: true })
        } catch (error) {
          console.error('Invitation response error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
