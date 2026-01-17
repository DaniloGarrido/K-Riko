<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getFirebaseAuth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const auth = getFirebaseAuth()
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/admin')
  } catch (e) {
    if (e.code === 'auth/invalid-credential') {
        error.value = 'Correo o contraseña incorrectos.'
    } else {
        error.value = 'Error iniciando sesión: ' + e.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-menu-base flex items-center justify-center p-4">
    <div class="bg-black/30 p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl backdrop-blur-sm">
      <h1 class="monoton text-4xl text-center text-white mb-8">Admin</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-6 orbitron text-white">
        <div>
          <label class="block text-sm mb-2 text-gray-300">Correo Electrónico</label>
          <input 
            type="email" 
            v-model="email" 
            required
            class="w-full bg-black/40 border border-white/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-neon-pink transition"
            placeholder="admin@k-riko.cl"
          >
        </div>

        <div>
          <label class="block text-sm mb-2 text-gray-300">Contraseña</label>
          <input 
            type="password" 
            v-model="password" 
            required
            class="w-full bg-black/40 border border-white/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-neon-pink transition"
            placeholder="••••••••"
          >
        </div>

        <div v-if="error" class="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-500/30">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-menu-item hover:bg-purple-800 text-white font-bold py-3 rounded-xl transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>
      
      <div class="mt-8 text-center">
        <router-link to="/" class="text-gray-400 hover:text-white text-sm underline underline-offset-4">
          ← Volver al Menú
        </router-link>
      </div>
    </div>
  </div>
</template>
