/**
 * Custom i18n hooks — drop-in replacement untuk next-intl
 * Mendukung: useTranslations, useLocale, useMessages
 */
import React, { useContext, useCallback } from 'react'
import { I18nContext } from './context'

type RichValues = Record<
  string,
  React.ReactNode | ((chunk: React.ReactNode) => React.ReactNode)
>

/**
 * Mem-parse string i18n yang memiliki tag (contoh: <strong>text</strong>)
 * dan variabel (contoh: {code}) secara aman dan merendernya menggunakan React elements.
 */
function parseRichText(text: string, values: RichValues): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let lastIndex = 0
  // regex untuk mencocokkan tag <tag>content</tag> atau placeholder {variable}
  const regex = /<(\w+)>(.*?)<\/\1>|\{(\w+)\}/g
  let match
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index
    
    // Tambahkan teks biasa sebelum kecocokan
    if (matchIndex > lastIndex) {
      result.push(text.substring(lastIndex, matchIndex))
    }
    
    if (match[1]) {
      // Ini adalah tag HTML: match[1] = nama tag, match[2] = konten di dalam tag
      const tagName = match[1]
      const content = match[2]
      
      const childNodes = parseRichText(content, values)
      const children = childNodes.length === 1 ? childNodes[0] : childNodes
      
      if (tagName in values) {
        const val = values[tagName]
        if (typeof val === 'function') {
          result.push((val as Function)(children))
        } else {
          result.push(val)
        }
      } else {
        result.push(children)
      }
    } else if (match[3]) {
      // Ini adalah placeholder variabel {name}: match[3] = nama variabel
      const varName = match[3]
      if (varName in values) {
        const val = values[varName]
        if (typeof val === 'function') {
          result.push((val as Function)(null))
        } else {
          result.push(val)
        }
      } else {
        result.push(`{${varName}}`)
      }
    }
    
    lastIndex = regex.lastIndex
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
