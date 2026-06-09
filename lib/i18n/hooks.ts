/**
 * Custom i18n hooks — drop-in replacement untuk next-intl
 * Mendukung: useTranslations, useLocale, useMessages
 */
import { useContext, useCallback } from 'react'
import { I18nContext } from './context'

/**
 * Helper: ambil value dari nested object pakai dot notation
 * Contoh: getNestedValue(obj, "Hero.typing.build") → obj.Hero.typing.build
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Interpolasi variabel dalam string template
 * Contoh: interpolate("Hello {name}!", { name: "World" }) → "Hello World!"
 */
function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`
  )
}

type TranslationFunction = {
  (key: string, values?: Record<string, string | number>): string
  raw: (key: string) => unknown
}

/**
 * Drop-in replacement untuk useTranslations dari next-intl
 * Mendukung namespace, dot notation, dan interpolasi variabel
 */
export function useTranslations(namespace?: string): TranslationFunction {
  const { messages } = useContext(I18nContext)

  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const fullPath = namespace ? `${namespace}.${key}` : key
      const value = getNestedValue(messages, fullPath)

      if (typeof value === 'string') {
        return interpolate(value, values)
      }

      // Fallback: tampilkan key jika tidak ditemukan
      return fullPath
    },
    [messages, namespace],
  )

  // Method raw untuk akses value non-string (array, object)
  t.raw = (key: string): unknown => {
    const fullPath = namespace ? `${namespace}.${key}` : key
    return getNestedValue(messages, fullPath)
  }

  return t
}

/**
 * Drop-in replacement untuk useLocale dari next-intl
 */
export function useLocale(): string {
  const { locale } = useContext(I18nContext)
  return locale
}

/**
 * Drop-in replacement untuk useMessages dari next-intl
 */
export function useMessages(): Record<string, unknown> {
  const { messages } = useContext(I18nContext)
  return messages
}
