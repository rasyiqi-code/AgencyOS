import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { listFiles, uploadFile } from '@/lib/integrations/storage'
import sharp from 'sharp'

export const Route = createFileRoute('/api/storage/media')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) return json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const url = new URL(request.url)
          const prefix = url.searchParams.get('prefix') || undefined

          const files = await listFiles(prefix)
          return json({ files })
        } catch (error) {
          console.error('[Storage API] List error:', error)
          return json({
            error: 'Failed to list media files',
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 })
        }
      },
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) return json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const formData = await request.formData()
          const file = formData.get('file') as File
          const folder = formData.get('folder')?.toString() || 'media'

          if (!file) {
            return json({ error: 'No file provided' }, { status: 400 })
          }

          const MAX_FILE_SIZE = 15 * 1024 * 1024
          if (file.size > MAX_FILE_SIZE) {
            return json({ error: 'File size exceeds the 15MB limit' }, { status: 400 })
          }

          let buffer: Uint8Array = new Uint8Array(await file.arrayBuffer())
          let finalFileName = file.name
          let finalType = file.type

          const isProcessableImage = file.type.startsWith('image/') &&
            !file.type.includes('svg') &&
            !file.type.includes('webp')

          if (isProcessableImage) {
            try {
              const processedBuffer = await sharp(buffer)
                .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80, effort: 2 })
                .toBuffer()
              buffer = processedBuffer

              const baseName = file.name.includes('.')
                ? file.name.substring(0, file.name.lastIndexOf('.'))
                : file.name
              finalFileName = `${baseName}.webp`
              finalType = 'image/webp'
            } catch (sharpError) {
              console.error('[Storage API] Sharp conversion error, falling back to original:', sharpError)
            }
          }

          const storagePath = `${folder}/${Date.now()}-${finalFileName}`
          const url = await uploadFile(buffer, storagePath, finalType)

          return json({
            success: true,
            url,
            fileName: storagePath,
            size: buffer.length,
            type: finalType,
            originalName: file.name
          })
        } catch (error) {
          console.error('[Storage API] Upload error:', error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          const errorName = error instanceof Error ? error.name : 'UnknownError'

          return json({
            error: 'Failed to upload file',
            details: errorMessage,
            errorType: errorName
          }, { status: 500 })
        }
      }
    }
  }
})
