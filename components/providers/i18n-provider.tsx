'use client'

import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'

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
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
