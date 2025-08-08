import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from "@tailwindcss/vite";
import dotenv from 'dotenv';

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  // base: "./",
  // gehost op GitHub Pages
  // Zorg ervoor dat de base URL overeenkomt met de repository naam
  // in dit geval is de repository naam "kraakscore"
  // lokaal gehost op www.jota.nl/kraakscore/
  base: "/laurierboom/kraakscore/",
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
