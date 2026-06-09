import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import type enMessages from '../../messages/en.json'

type Messages = typeof enMessages

export const getLocaleMessages = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ locale: string; messages: Messages }> => {
    const cookieLocale = getCookie('NEXT_LOCALE')
    const locale = cookieLocale?.slice(0, 2) === 'id' ? 'id' : 'en'

    const module = await import(`../../messages/${locale}.json`)
    const messages: Messages = (module.default || module) as Messages

    return { locale, messages }
  },
)
