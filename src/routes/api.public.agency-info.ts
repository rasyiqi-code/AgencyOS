import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getSystemSettings } from '@/src/server/settings'

export const Route = createFileRoute('/api/public/agency-info')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const settings = await getSystemSettings({ data: ['AGENCY_NAME'] })

          const settingsMap = (settings || []).reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
          }, {} as Record<string, string>)

          return json(settingsMap)
        } catch (error) {
          console.error('Public Agency Info Error:', error)
          return json({ error: 'Internal Error' }, { status: 500 })
        }
      }
    }
  }
})
