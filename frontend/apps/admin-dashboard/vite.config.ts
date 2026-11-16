import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: 'localhost',

    // Ignore TypeScript config files to prevent reload loops
    watch: {
      ignored: [
        '**/tsconfig.json',
        '**/tsconfig.*.json',
      ],
    },

    proxy: {
      '/backend': {
        target: 'http://localhost:5185',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
    },
  },

  preview: {
    port: 4173,
  },
});