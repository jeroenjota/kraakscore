import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/kraakscore/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        
      },
    },
  },
  server: {
    port: 5174,
  },
  plugins: [
    vue(),
    tailwindcss(),
  ],
}))
