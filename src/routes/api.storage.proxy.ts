import { createFileRoute } from '@tanstack/react-router'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getClient } from '@/lib/integrations/storage'

export const Route = createFileRoute('/api/storage/proxy')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const key = url.searchParams.get('key')

        if (!key) {
          return new Response('Missing key', { status: 400 })
        }

        try {
          const s3 = await getClient()
          if (!s3) {
            return new Response('Storage not configured', { status: 500 })
          }

          const command = new GetObjectCommand({
            Bucket: s3.bucketName,
            Key: key
          })

          const response = await s3.client.send(command)

          if (!response.Body) {
            return new Response('File not found', { status: 404 })
          }

          const stream = response.Body.transformToWebStream()

          return new Response(stream, {
            headers: {
              'Content-Type': response.ContentType || 'application/octet-stream',
              'Cache-Control': 'public, max-age=31536000, immutable'
            }
          })
        } catch (error) {
          console.error('Proxy error:', error)
          return new Response('Failed to fetch image', { status: 500 })
        }
      }
    }
  }
})
