import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  base: '/MemoryShell/',
  plugins: [
    tailwindcss(),
    solidPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MemoryShell',
        short_name: 'MemoryShell',
        start_url: '/MemoryShell/',
        scope: '/MemoryShell/',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/MemoryShell/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/MemoryShell/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
})
