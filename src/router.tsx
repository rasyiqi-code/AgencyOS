import { createRouter, Link } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { deLocalizeUrl, localizeUrl } from './lib/i18n'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
    defaultNotFoundComponent: () => {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8 text-center">
          <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
          <h2 className="text-xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-md">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
          </p>
          <Link
            to="/"
            className="text-xs bg-yellow-500 hover:bg-yellow-500/90 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      )
    }
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
