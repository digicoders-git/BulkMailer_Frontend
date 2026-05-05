import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/parse-excel': 'http://localhost:3000',
      '/send-emails': 'http://localhost:3000',
      '/templates': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/smtp-config': 'http://localhost:3000',
      '/smtp-test': 'http://localhost:3000',
    }
  }
})
