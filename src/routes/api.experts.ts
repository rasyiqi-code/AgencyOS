import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getCachedUsers } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/experts')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const experts = await prisma.squadProfile.findMany({
            where: { status: 'vetted' },
            orderBy: { name: 'asc' }
          })

          let stackUsers: any[] = []
          try {
            stackUsers = await getCachedUsers()
          } catch (e) {
            console.error('Failed to list stack users:', e)
          }

          const formattedExperts = experts.map(expert => {
            const stackUser = stackUsers.find(u => u.id === expert.userId)
            return {
              id: expert.id,
              name: expert.name,
              role: expert.role,
              specialty: expert.specialty || 'Expert',
              exp: `${expert.yearsOfExp}+ Years`,
              image: stackUser?.profileImageUrl || expert.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=random`
            }
          })

          return json(formattedExperts, {
            headers: {
              'Cache-Control': 'public, max-age=3600'
            }
          })
        } catch (error) {
          console.error('Failed to fetch experts:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
