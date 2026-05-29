import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/planner/',
  server: {
    proxy: {
      '/planner/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
