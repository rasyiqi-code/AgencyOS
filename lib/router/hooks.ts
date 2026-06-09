/**
 * Custom router hooks untuk kompatibilitas API
 * 
 * Modul ini menyediakan hooks navigasi yang membungkus TanStack Router
 * dengan API yang konsisten di seluruh aplikasi. Bukan shim sementara —
 * ini adalah abstraksi permanen agar komponen tidak langsung bergantung
 * pada API internal TanStack Router.
 */
import {
  useLocation,
  useSearch as tsrUseSearch,
  useNavigate,
  useRouter as tsrUseRouter,
} from "@tanstack/react-router"
import { useMemo } from 'react'

/**
 * URLSearchParams-compatible wrapper untuk objek search dari TanStack Router
 * agar komponen yang expect interface URLSearchParams tetap berfungsi
 */
class SearchParamsWrapper {
  private params: Map<string, string>

  constructor(init?: Record<string, unknown>) {
    this.params = new Map()
    if (init) {
      for (const [key, value] of Object.entries(init)) {
        if (value !== undefined && value !== null) {
          this.params.set(key, String(value))
        }
      }
    }
  }

  get(key: string) { return this.params.get(key) ?? null }
  getAll(key: string) { return [this.params.get(key)].filter(Boolean) as string[] }
  has(key: string) { return this.params.has(key) }
  forEach(fn: (value: string, key: string) => void) { this.params.forEach(fn) }
  entries() { return this.params.entries() }
  keys() { return this.params.keys() }
  values() { return this.params.values() }
  toString() { return Array.from(this.params.entries()).map(([k, v]) => `${k}=${v}`).join('&') }
  [Symbol.iterator]() { return this.params[Symbol.iterator]() }
  get size() { return this.params.size }
}

/**
 * Hook untuk mendapatkan pathname saat ini
 */
export function usePathname() {
  return useLocation().pathname
}

/**
 * Hook untuk mendapatkan search params dalam format URLSearchParams-compatible
 */
export function useSearchParams() {
  let search: Record<string, unknown> = {}
  try {
    search = tsrUseSearch({ strict: false }) as Record<string, unknown>
  } catch {
    // Router context belum tersedia saat SSR
  }

  return useMemo(() => new SearchParamsWrapper(search), [search])
}

/**
 * Hook router dengan API navigasi yang konsisten
 */
export function useRouter() {
  const navigate = useNavigate()
  const router = tsrUseRouter()
  return {
    push: (to: string) => navigate({ to } as any),
    replace: (to: string) => navigate({ to, replace: true } as any),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    invalidate: () => router.invalidate(),
    prefetch: () => {},
  }
}
