import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'

export const Route = createFileRoute('/api/system/keys/status')({
  server: {
    handlers: {
      GET: async () => {
        // Cari apakah ada Google Gemini Key yang aktif di database
        const key = await prisma.systemKey.findFirst({
          where: { provider: 'google', isActive: true }
        })
        return json({ configured: !!key })
      }
    }
  }
})
