import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from "@tailwindcss/vite";
import dotenv from 'dotenv';

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
