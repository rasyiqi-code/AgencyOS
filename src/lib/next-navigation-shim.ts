import {
  redirect as tsrRedirect,
  useLocation,
  useSearch as tsrUseSearch,
  useNavigate,
} from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

class MockURLSearchParams {
  private params: Map<string, string>

  constructor(init?: Record<string, unknown>) {
    this.params = new Map()
    if (init) {
      for (const [key, value] of Object.entries(init)) {
        this.params.set(key, String(value))
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

export const RedirectType = {
  push: 'push',
  replace: 'replace',
} as const

export function redirect(url: string, type?: 'push' | 'replace') {
  throw tsrRedirect({ to: url } as any)
}

export function permanentRedirect(url: string, type?: 'push' | 'replace') {
  throw tsrRedirect({ to: url } as any)
}

export function notFound() {
  throw tsrRedirect({ to: '/' } as any)
}

export function usePathname() {
  return useLocation().pathname
}

export function useSearchParams() {
  const navigate = useNavigate()
  let search: Record<string, unknown> = {}
  try {
    search = tsrUseSearch() as Record<string, unknown>
  } catch {
    // Router context not available during SSR
  }

  const searchParams = useMemo(() => new MockURLSearchParams(search), [search])
  const setSearchParams = useCallback(
    (params: Record<string, string>) => {
      navigate({ search: params as any })
    },
    [navigate],
  )

  return [searchParams, setSearchParams] as const
}

export function useRouter() {
  const navigate = useNavigate()
  return {
    push: (to: string) => navigate({ to } as any),
    replace: (to: string) => navigate({ to, replace: true } as any),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  }
}

export function useParams<T>(): T {
  return useLocation().pathname as any
}

export function useSelectedLayoutSegment() {
  return null
}

export function useSelectedLayoutSegments() {
  return []
}
