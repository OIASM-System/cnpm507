import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Bỏ qua không theo dõi các thư mục gây trigger restart liên tục
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    }
  }
})