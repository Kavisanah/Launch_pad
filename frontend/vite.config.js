import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindCSS from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const keyPath = path.resolve(__dirname, '../certs/server.key')
const certPath = path.resolve(__dirname, '../certs/server.crt')
const hasCert = fs.existsSync(keyPath) && fs.existsSync(certPath)

export default defineConfig({
  plugins: [react(), tailwindCSS()],
  server: {
    port: 5173,
    strictPort: true,
    https: hasCert ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    } : false,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  }
})
