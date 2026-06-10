import path from 'path'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: 'react-dom/server', replacement: path.resolve(__dirname, 'src/lib/react-dom-server-shim.ts') },
    ],
  },
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: ['@hexclave/tanstack-start'],
  },
  plugins: [
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
        process: false,
      },
    }),
    tanstackStart(),
    nitro(),
    viteReact(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false, // Registrasi ditangani secara manual via service-worker-registrar.tsx
      manifest: {
        name: 'AgencyOS',
        short_name: 'AgencyOS',
        description: 'AgencyOS Client Portal',
        theme_color: '#FFB800',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/dashboard',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})


