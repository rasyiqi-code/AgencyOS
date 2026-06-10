import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { isAdmin } from '@/lib/shared/auth-helpers'

export const Route = createFileRoute('/api/feedback')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const formData = await request.formData()
          const projectId = formData.get('projectId') as string
          const feedbackId = formData.get('feedbackId') as string
          const content = formData.get('content') as string
          const type = formData.get('type') as string
          let imageUrl = formData.get('imageUrl') as string
          const file = formData.get('imageFile') as File | null

          if (!content) {
            return json({ error: 'Missing content' }, { status: 400 })
          }

          if (file && file.size > 0 && file.name !== 'undefined') {
            try {
              const { uploadFile } = await import('@/lib/integrations/storage')
              const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
              const folder = feedbackId ? 'comments' : 'feedback'
              const path = `projects/${projectId}/${folder}/${Date.now()}-${safeName}`
              imageUrl = await uploadFile(file, path)
            } catch (uploadError) {
              console.error('Failed to upload file:', uploadError)
              return json({ error: 'Failed to upload file' }, { status: 500 })
            }
          }

          if (feedbackId) {
            const userIsAdmin = await isAdmin()
            const commentRole = userIsAdmin ? 'admin' : 'client'

            const comment = await prisma.feedbackComment.create({
              data: {
                feedbackId,
                content,
                imageUrl: imageUrl || null,
                role: commentRole
              }
            })

            return json(comment)
          } else {
            if (!projectId) {
              return json({ error: 'Missing project ID' }, { status: 400 })
            }

            const feedback = await prisma.feedback.create({
              data: {
                projectId,
                content,
                type: type || 'bug',
                imageUrl: imageUrl || null,
                status: 'open'
              }
            })

            return json(feedback)
          }
        } catch (error) {
          console.error('Error processing feedback/comment:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      },
      PATCH: async ({ request }: { request: Request }) => {
        if (!await isAdmin()) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const { id, status } = await request.json()

          if (!id || !status) {
            return json({ error: 'Missing required fields' }, { status: 400 })
          }

          const newStatus = status === 'open' ? 'resolved' : 'open'

          const feedback = await prisma.feedback.update({
            where: { id },
            data: { status: newStatus }
          })

          return json(feedback)
        } catch (error) {
          console.error('Error updating feedback:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
