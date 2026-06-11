import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/kraakscore/' : '/',
  server: {
    port: 5174,
  },
  plugins: [
    vue(),
    tailwindcss(),
  ],
}))
