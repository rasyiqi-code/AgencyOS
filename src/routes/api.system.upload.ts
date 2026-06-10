import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { uploadFile } from '@/lib/integrations/storage'

export const Route = createFileRoute('/api/system/upload')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) return json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const formData = await request.formData()
          const file = formData.get('file') as File

          if (!file) return json({ error: 'No file provided' }, { status: 400 })

          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
          if (!allowedTypes.includes(file.type)) {
            return json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
          }

          const maxSize = 5 * 1024 * 1024
          if (file.size > maxSize) {
            return json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
          }

          const timestamp = Date.now()
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const key = `logos/${timestamp}-${safeName}`

          const url = await uploadFile(file, key)

          return json({ success: true, url })
        } catch (error) {
          console.error('R2 Upload Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
