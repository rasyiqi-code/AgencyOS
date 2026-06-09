export async function cookies() {
  const { default: server } = await import('@tanstack/react-start/server')
  const allCookies: Record<string, string> = server.getCookies() ?? {}
  const cookieMap = new Map(Object.entries(allCookies))
  return {
    get: (name: string) => ({ value: cookieMap.get(name) ?? '' }),
    getAll: () => Array.from(cookieMap.entries()).map(([name, value]) => ({ name, value })),
    has: (name: string) => cookieMap.has(name),
    set: (name: string, value: string) => {
      server.setCookie(name, value)
    },
    delete: (name: string) => {
      server.deleteCookie(name)
    },
    [Symbol.iterator]: () => cookieMap[Symbol.iterator](),
  }
}

export async function headers() {
  const { getRequestHeader } = await import('@tanstack/react-start/server')
  return {
    get: (name: string) => getRequestHeader(name) ?? null,
    has: (name: string) => getRequestHeader(name) !== undefined,
    entries: () => [],
    keys: () => [],
    values: () => [],
    forEach: () => {},
  }
}
