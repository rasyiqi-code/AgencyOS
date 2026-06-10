import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { deleteFile } from '@/lib/integrations/storage'

export const Route = createFileRoute('/api/storage/media/$')({
  server: {
    handlers: {
      DELETE: async ({ params }: { params: { _splat: string } }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) return json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const key = decodeURIComponent(params._splat)
          await deleteFile(key)
          return json({ success: true })
        } catch (error) {
          console.error('[Storage API] Delete error:', error)
          return json({
            error: 'Failed to delete file',
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 })
        }
      }
    }
  }
})
