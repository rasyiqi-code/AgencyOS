/**
 * Context i18n custom — pengganti NextIntlClientProvider
 * Menyediakan locale dan messages ke seluruh component tree
 */
import { createContext } from 'react'

export interface I18nContextValue {
  locale: string
  messages: Record<string, unknown>
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  messages: {},
})
