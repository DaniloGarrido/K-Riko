import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga todas las variables de entorno (incluidas las de GitHub Actions)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    // Si la variable VITE_BASE existe en GitHub la usa, 
    // de lo contrario usa '/K-Riko/' por defecto para producción
    base: env.VITE_BASE || '/K-Riko/'
  }
})