import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/squad/missions/complete')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const { missionId } = await request.json()

          const project = await prisma.project.findUnique({
            where: { id: missionId },
            include: { service: true }
          })

          if (!project || project.developerId !== user.id) {
            return json({ error: 'Unauthorized or mission not found' }, { status: 401 })
          }

          if (project.status === 'done') {
            return json({ error: 'Mission already completed' }, { status: 400 })
          }

          const updatedProject = await prisma.project.update({
            where: { id: missionId },
            data: { status: 'done' }
          })

          return json({ success: true, project: updatedProject })
        } catch (error) {
          console.error('Complete mission error:', error)
          return json({ error: 'Internal server error' }, { status: 500 })
        }
      }
    }
  }
})
