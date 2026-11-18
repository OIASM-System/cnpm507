import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
 server: {
  host: '0.0.0.0',
  watch: {
    usePolling: true,
    interval: 300,
    ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/tsconfig.json'],
    },
    proxy: {
      '/backend': {
        target: 'http://localhost:5185',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, '') || '/'
      }
    }
  }
})