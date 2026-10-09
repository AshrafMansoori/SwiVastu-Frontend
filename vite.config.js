import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { env } from 'node:process'

const backendTarget =
  env.VITE_API_PROXY_TARGET || 'https://swi-back.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: true,
      },
      '/socket': {
        target: backendTarget,
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
})
