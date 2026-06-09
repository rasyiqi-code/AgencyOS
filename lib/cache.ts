const cacheStore = new Map<string, { data: unknown; expiry: number }>()

export function unstable_cache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  key: string[],
  options?: { revalidate?: number; tags?: string[] },
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  const cacheKey = key.join(':')
  const ttl = options?.revalidate ?? 300

  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const cached = cacheStore.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return cached.data as Awaited<ReturnType<T>>
    }
    const data = await fn(...args)
    cacheStore.set(cacheKey, { data, expiry: Date.now() + ttl * 1000 })
    return data as Awaited<ReturnType<T>>
  }
}
