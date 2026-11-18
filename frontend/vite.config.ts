import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // /backend/* -> http://localhost:5185/*  (ASP.NET Core, profile "http")
    proxy: {
      '/backend': {
        target: 'http://localhost:5185',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
    },
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    }
  }
})
