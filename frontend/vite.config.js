import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:18000',
      '/photos': 'http://localhost:18000',
      '/uploads': 'http://localhost:18000',
    }
  }
})
