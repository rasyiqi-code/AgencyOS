import path from 'path'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: 'next/navigation', replacement: path.resolve(__dirname, 'src/lib/next-navigation-shim.ts') },
      { find: 'react-dom/server', replacement: path.resolve(__dirname, 'src/lib/react-dom-server-shim.ts') },
    ],
  },
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: ['@hexclave/next'],
  },
  plugins: [
    tanstackStart(),
    viteReact(),
    tailwindcss(),
  ],
})
