import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
      },
    }),
  ],
  server: {
    port: 3003,
    host: '0.0.0.0', // スマホからのアクセスを許可
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: true,
  },
})
