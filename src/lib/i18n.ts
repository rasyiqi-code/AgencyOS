import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import type enMessages from '../../messages/en.json'

type Messages = typeof enMessages

// Server function untuk mengambil data terjemahan dinamis berdasarkan locale
export const getLocaleMessages = createServerFn({ method: 'GET' })
  .validator((locale: string | undefined) => locale)
  .handler(
    async ({ data: inputLocale }): Promise<{ locale: string; messages: Messages }> => {
      const cookieLocale = getCookie('NEXT_LOCALE')
      const locale = inputLocale === 'id' || inputLocale === 'en'
        ? inputLocale
        : (cookieLocale?.slice(0, 2) === 'id' ? 'id' : 'en')

      const module = await import(`../../messages/${locale}.json`)
      const messages: Messages = (module.default || module) as Messages

      return { locale, messages }
    },
  )

// Helper isomorphic untuk mendeteksi locale aktif saat ini
export function getCurrentLocaleIsomorphic(): string {
  if (typeof window !== 'undefined') {
    const match = /^\/(id|en)(?:\/|$)/.exec(window.location.pathname)
    if (match) return match[1]
    
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]
    return cookieValue === 'id' ? 'id' : 'en'
  } else {
    try {
      // Membaca getRequest secara dinamis hanya di server untuk menghindari import protection di client
      const req = (globalThis as any).require ? (globalThis as any).require('@tanstack/react-start/server').getRequest() : null
      if (req) {
        const reqUrl = new URL(req.url)
        const match = /^\/(id|en)(?:\/|$)/.exec(reqUrl.pathname)
        if (match) return match[1]
        
        const cookieHeader = req.headers.get('cookie') || ''
        const cookieValue = cookieHeader
          .split('; ')
          .find((row: string) => row.trim().startsWith('NEXT_LOCALE='))
          ?.split('=')[1]
        return cookieValue === 'id' ? 'id' : 'en'
      }
    } catch {
      // Abaikan jika dipanggil di luar scope request
    }
    return 'en'
  }
}

// Menghapus prefix locale dari path URL sebelum dicocokkan oleh Router
export function deLocalizeUrl(url: URL): URL {
  const pathname = url.pathname
  const match = /^\/(id|en)(?:\/|$)/.exec(pathname)
  if (match) {
    const locale = match[1]
    const newUrl = new URL(url.toString())
    // Hapus prefix locale dari pathname
    newUrl.pathname = pathname.replace(/^\/(id|en)/, '') || '/'
    return newUrl
  }
  return url
}

// Menambahkan prefix locale ke path URL untuk generator tag Link
export function localizeUrl(url: URL): URL {
  const locale = getCurrentLocaleIsomorphic()
  if (locale !== 'en') {
    const newUrl = new URL(url.toString())
    // Pastikan tidak menduplikasi prefix
    if (!/^\/(id|en)(?:\/|$)/.test(newUrl.pathname)) {
      newUrl.pathname = `/${locale}${newUrl.pathname === '/' ? '' : newUrl.pathname}`
    }
    return newUrl
  }
  return url
}

