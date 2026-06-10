const cacheStore = new Map<string, { data: unknown; expiry: number; tags?: string[] }>()

export function unstable_cache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  key: string[],
  options?: { revalidate?: number; tags?: string[] },
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  const cacheKey = key.join(':')
  const ttl = options?.revalidate ?? 300
  const tags = options?.tags

  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const cached = cacheStore.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return cached.data as Awaited<ReturnType<T>>
    }
    const data = await fn(...args)
    cacheStore.set(cacheKey, { data, expiry: Date.now() + ttl * 1000, tags })
    return data as Awaited<ReturnType<T>>
  }
}

// Fungsi untuk menghapus entri cache yang memiliki tag tertentu (cache invalidation)
export function revalidateTag(tag: string) {
  for (const [key, value] of cacheStore.entries()) {
    if (value.tags?.includes(tag)) {
      cacheStore.delete(key)
    }
  }
}

// Fungsi mock revalidatePath untuk kecocokan API lama
export function revalidatePath(path: string) {
  // Sementara no-op atau bisa menghapus seluruh cache jika diinginkan
}

