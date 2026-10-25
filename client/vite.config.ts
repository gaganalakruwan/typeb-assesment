import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward API calls to the server so the browser sees one origin (no CORS in dev).
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
