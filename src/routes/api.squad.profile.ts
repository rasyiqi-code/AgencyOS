import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { squadService } from '@/lib/server/squad'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/squad/profile')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const body = await request.json()
          const profile = await squadService.createProfile({
            userId: user.id,
            ...body
          })

          return json({ success: true, data: profile })
        } catch (error: any) {
          return json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
          )
        }
      },
      GET: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(request.url)
        const userId = url.searchParams.get('userId')

        if (!userId) {
          return json({ error: 'UserId is required' }, { status: 400 })
        }

        try {
          const profile = await squadService.getProfile(userId)
          return json({ success: true, data: profile })
        } catch {
          return json(
            { success: false, error: 'Failed to fetch profile' },
            { status: 500 }
          )
        }
      },
      PATCH: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const body = await request.json()
          const profile = await squadService.getProfile(user.id)
          if (!profile) {
            return json({ error: 'Profile not found' }, { status: 404 })
          }

          const updatedProfile = await squadService.updateProfile(user.id, body)
          return json({ success: true, data: updatedProfile })
        } catch (error: any) {
          return json(
            { success: false, error: error.message || 'Failed to update profile' },
            { status: 500 }
          )
        }
      }
    }
  }
})
