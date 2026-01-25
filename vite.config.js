import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Seteamos la base dinámicamente usando la variable de entorno del CI
  // Si estamos en local (sin la variable), usamos '/'
  base: process.env.VITE_BASE || '/',
})