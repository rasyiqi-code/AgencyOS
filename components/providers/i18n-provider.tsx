/**
 * Provider i18n custom — pengganti NextIntlClientProvider
 * Membungkus component tree dengan context locale dan messages
 */
import type { ReactNode } from 'react'
import { I18nContext } from '@/lib/i18n/context'

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string
  messages: Record<string, unknown>
  children: ReactNode
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  )
}
