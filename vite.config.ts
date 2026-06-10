import path from 'path'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

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
      },
    }),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
  ],
})

