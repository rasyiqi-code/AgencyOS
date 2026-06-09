/**
 * Custom i18n hooks — drop-in replacement untuk next-intl
 * Mendukung: useTranslations, useLocale, useMessages
 */
import React, { useContext, useCallback } from 'react'
import { I18nContext } from './context'

type RichValues = Record<string, (chunk: React.ReactNode) => React.ReactNode>

/**
 * Mem-parse string i18n yang memiliki tag (contoh: <strong>text</strong>)
 * secara aman dan merendernya menggunakan React elements.
 */
function parseRichText(text: string, values: RichValues): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let lastIndex = 0
  const tagRegex = /<(\w+)>(.*?)<\/\1>/g
  let match
  
  while ((match = tagRegex.exec(text)) !== null) {
    const [_, tagName, content] = match
    const matchIndex = match.index
    
    // Tambahkan teks biasa sebelum tag
    if (matchIndex > lastIndex) {
      result.push(text.substring(lastIndex, matchIndex))
    }
    
    // Parse content secara rekursif
    const childNodes = parseRichText(content, values)
    
    // Panggil render function jika terdaftar di values
    if (tagName in values) {
      result.push(values[tagName](childNodes.length === 1 ? childNodes[0] : childNodes))
    } else {
      result.push(childNodes.length === 1 ? childNodes[0] : childNodes)
    }
    
    lastIndex = tagRegex.lastIndex
  }
  
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }
  
  return result.length > 0 ? result : [text]
}

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
  rich: (key: string, values?: RichValues) => React.ReactNode
}

/**
 * Drop-in replacement untuk useTranslations dari next-intl
 * Mendukung namespace, dot notation, dan interpolasi variabel
 */
export function useTranslations(namespace?: string): TranslationFunction {
  const { messages } = useContext(I18nContext)

  const tBase = useCallback(
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

  const t = tBase as any

  // Method raw untuk akses value non-string (array, object)
  t.raw = (key: string): unknown => {
    const fullPath = namespace ? `${namespace}.${key}` : key
    return getNestedValue(messages, fullPath)
  }

  // Method rich untuk render elemen React kaya
  t.rich = (key: string, values?: RichValues): React.ReactNode => {
    const fullPath = namespace ? `${namespace}.${key}` : key
    const value = getNestedValue(messages, fullPath)

    if (typeof value === 'string') {
      if (!values) return value
      const parsed = parseRichText(value, values)
      return parsed.length === 1 ? parsed[0] : React.createElement(React.Fragment, null, ...parsed)
    }

    return fullPath
  }

  return t as TranslationFunction
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
