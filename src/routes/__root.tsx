import type { ReactNode } from 'react'
import { useEffect, useState, lazy, Suspense } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { QueryProvider } from '@/components/providers/query-provider'
import { CurrencyProvider } from '@/components/providers/currency-provider'
import { Toaster } from '@/components/ui/sonner'
import { HexclaveProvider, HexclaveTheme } from '@hexclave/tanstack-start'
import { hexclaveClientApp } from '@/lib/config/hexclave'
import { I18nProvider } from '@/components/providers/i18n-provider'
import enMessages from '@/messages/en.json'
import { getLocaleMessages } from '@/src/lib/i18n'
import '../styles/app.css'

const ServiceWorkerRegistrar = lazy(() => import('@/components/pwa/service-worker-registrar').then(m => ({ default: m.ServiceWorkerRegistrar })))
const InstallPrompt = lazy(() => import('@/components/pwa/install-prompt').then(m => ({ default: m.InstallPrompt })))

type Messages = typeof enMessages

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'AgencyOS' },
      { name: 'theme-color', content: '#FFB800' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    ],
    links: [
      { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
      { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
      { rel: 'preconnect', href: 'https://www.google-analytics.com' },
      { rel: 'preconnect', href: 'https://i.pravatar.cc' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-6xl font-bold text-zinc-700">404</h1>
      <p className="text-zinc-400 mt-4">Page not found</p>
      <a href="/" className="mt-6 text-yellow-500 hover:text-yellow-400 underline">
        Go home
      </a>
    </div>
  ),
})

function RootComponent() {
  const [i18n, setI18n] = useState<{ locale: string; messages: Messages }>({
    locale: 'en',
    messages: enMessages,
  })

  useEffect(() => {
    getLocaleMessages().then(setI18n)
  }, [])

  return (
    <RootDocument i18n={i18n}>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({
  children,
  i18n,
}: Readonly<{
  children: ReactNode
  i18n: { locale: string; messages: Messages }
}>) {
  return (
    <html lang={i18n.locale} className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-black text-white antialiased relative">
        <QueryProvider>
          <CurrencyProvider initialLocale={i18n.locale}>
            <HexclaveProvider app={hexclaveClientApp}>
              <HexclaveTheme>
                <I18nProvider locale={i18n.locale} messages={i18n.messages}>
                  {children}
                </I18nProvider>
                <Toaster />
                <Suspense fallback={null}>
                  <ServiceWorkerRegistrar />
                </Suspense>
                <Suspense fallback={null}>
                  <InstallPrompt />
                </Suspense>
              </HexclaveTheme>
            </HexclaveProvider>
          </CurrencyProvider>
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
