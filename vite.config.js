import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Usar base relativa './' es lo más seguro para GitHub Pages 
  // ya que funciona independientemente del nombre del repositorio.
  base: './',
})