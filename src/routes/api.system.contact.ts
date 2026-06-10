import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getSystemSettings } from '@/src/server/settings'
import { type SystemSetting } from '@prisma/client'

const CONTACT_EMAIL_KEY = 'CONTACT_EMAIL'
const CONTACT_PHONE_KEY = 'CONTACT_PHONE'
const CONTACT_TELEGRAM_KEY = 'CONTACT_TELEGRAM'
const CONTACT_ADDRESS_KEY = 'CONTACT_ADDRESS'
const AGENCY_NAME_KEY = 'AGENCY_NAME'
const COMPANY_NAME_KEY = 'COMPANY_NAME'
const AGENCY_LOGO_KEY = 'AGENCY_LOGO'
const AGENCY_LOGO_DISPLAY_KEY = 'AGENCY_LOGO_DISPLAY'
const SERVICES_TITLE_KEY = 'SERVICES_TITLE'
const SERVICES_SUBTITLE_KEY = 'SERVICES_SUBTITLE'
const CONTACT_HOURS_KEY = 'CONTACT_HOURS'

export const Route = createFileRoute('/api/system/contact')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const settings = await getSystemSettings({
            data: [
              CONTACT_EMAIL_KEY,
              CONTACT_PHONE_KEY,
              CONTACT_TELEGRAM_KEY,
              CONTACT_ADDRESS_KEY,
              AGENCY_NAME_KEY,
              COMPANY_NAME_KEY,
              AGENCY_LOGO_KEY,
              AGENCY_LOGO_DISPLAY_KEY,
              SERVICES_TITLE_KEY,
              SERVICES_SUBTITLE_KEY,
              CONTACT_HOURS_KEY
            ]
          })

          const getVal = (key: string) => settings?.find((s: SystemSetting) => s.key === key)?.value || null

          return json({
            email: getVal(CONTACT_EMAIL_KEY),
            phone: getVal(CONTACT_PHONE_KEY),
            telegram: getVal(CONTACT_TELEGRAM_KEY),
            address: getVal(CONTACT_ADDRESS_KEY),
            agencyName: getVal(AGENCY_NAME_KEY),
            companyName: getVal(COMPANY_NAME_KEY),
            logoUrl: getVal(AGENCY_LOGO_KEY),
            logoDisplayMode: getVal(AGENCY_LOGO_DISPLAY_KEY),
            servicesTitle: getVal(SERVICES_TITLE_KEY),
            servicesSubtitle: getVal(SERVICES_SUBTITLE_KEY),
            hours: getVal(CONTACT_HOURS_KEY),
          })
        } catch (error) {
          console.error('System contact API error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
