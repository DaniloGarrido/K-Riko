import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno sin prefijo VITE_ para usar process.env
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    // Si VITE_BASE no existe (desarrollo local), usa '/'
    // Si existe (GitHub Actions), usa su valor dinámico
    base: env.VITE_BASE || '/',
  }
})