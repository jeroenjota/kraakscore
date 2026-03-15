import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/kraakscore/' : '/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
}))
