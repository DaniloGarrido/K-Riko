<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useMenuData } from '../services/data'

const rawData = ref({})
const rawSettings = ref({})
const loading = ref(true)

const { subscribeToMenu } = useMenuData()
let unsubscribeCursor = null

const processData = (fullMenu) => {
    rawSettings.value = fullMenu._settings || {}
    
    // Update Document Title dynamically
    const title = rawSettings.value.siteTitle || 'Carta Digital'
    document.title = title
        
    // Filter out settings and hidden items
    const data = {}
    for (const [key, items] of Object.entries(fullMenu)) {
        if (key === '_settings') continue
        data[key] = items ? items.filter(item => item.visible !== false) : []
    }
    rawData.value = data
    loading.value = false
}

const sections = computed(() => {
    // Get keys in the order specified in _settings.sectionOrder
    const order = rawSettings.value.sectionOrder || []
    
    // Get all category keys except _settings
    const keys = Object.keys(rawData.value)
    
    // Sort keys based on sectionOrder
    keys.sort((a, b) => {
        const indexA = order.indexOf(a)
        const indexB = order.indexOf(b)
        
        // If both keys are in sectionOrder, sort by their position
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        
        // If only one is in sectionOrder, that one comes first
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        
        // Otherwise keep original order (or alphabetical)
        return 0
    })

    return keys.map(key => {
        const columns = rawSettings.value[key]?.columns || [{ key: 'precio', label: 'Precio' }]
        // Calculate grid layout based on number of columns
        const gridStyle = `grid-template-columns: 1.5fr ${'1fr '.repeat(columns.length)}`
        
        return {
            id: key,
            title: key,
            items: rawData.value[key] || [],
            columns,
            gridStyle
        }
    })
})

const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
    unsubscribeCursor = subscribeToMenu((data) => {
        processData(data)
    })
})

onUnmounted(() => {
    if (unsubscribeCursor) unsubscribeCursor()
})
</script>

<template>
  <div class="min-h-screen bg-menu-base pb-40">
    <!-- Loader Global -->
    <div v-if="loading" class="fixed inset-0 z-[100] bg-menu-base flex flex-col items-center justify-center p-8">
        <div class="relative mb-8">
            <div class="w-20 h-20 border-4 border-white/5 border-t-neon-pink rounded-full animate-spin"></div>
            <div class="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-neon-purple rounded-full animate-spin-reverse"></div>
        </div>
        <h2 class="monoton text-white text-2xl animate-pulse tracking-widest uppercase">Cargando Menú</h2>
    </div>

    <!-- Header Hero -->
    <h1 class="monoton h-screen text-white text-3xl sm:text-7xl text-center py-20 flex justify-center items-center px-4 leading-tight uppercase tracking-tighter">
        <template v-if="rawSettings.siteTitle">
            {{ rawSettings.siteTitle }}
        </template>
        <template v-else>
            Carta <br> Digital
        </template>
    </h1>
    
    <!-- Indice de Secciones -->
    <div class="h-screen bg-black/40 backdrop-blur-3xl rounded-xl text-center text-white w-[95%] max-w-3xl mx-auto shadow-2xl border border-white/5 flex flex-col justify-center items-center p-8">
        <h3 class="monoton text-4xl mb-12 text-shadow-lg tracking-widest text-white">Indice</h3>


        <div class="w-full orbitron grid grid-cols-1 uppercase font-black gap-6">
            <a v-for="section in sections" 
               :key="section.id" href="#" 
               @click.prevent="scrollToSection(section.id)" 
               class="bg-white/5 rounded-xl p-4 hover:bg-neon-pink hover:text-black transition-all duration-300 border border-white/5 shadow-xl scale-100 hover:scale-105 active:scale-95 focus:outline-none focus:ring-0">
                {{ section.title }}
            </a>
        </div>
    </div>

    <!-- Secciones Dinámicas -->
    <div v-for="section in sections" :key="section.id" :id="section.id" class="orbitron bg-black/40 backdrop-blur-xl p-4 pt-12 mt-20 sm:p-10 rounded-xl shadow-2xl w-[95%] max-w-3xl mx-auto text-white border border-white/5">
        <h2 class="monoton text-4xl text-center mb-10 capitalize tracking-tighter text-white">{{ section.title }}</h2>
        
        <!-- Table Header -->
        <div class="grid px-4 pb-4 text-gray-400 text-[10px] uppercase font-black text-center items-end mb-4 border-b border-white/5"
             :style="section.gridStyle">
            <div class="text-left font-bold">Item</div>
            <div v-for="col in section.columns" :key="col.key">
                {{ col.label }}
            </div>
        </div>

        <!-- Items List -->
        <ul class="flex flex-col gap-4">
            <li v-for="(item, index) in section.items" :key="index" class="bg-white/5 rounded-xl p-5 grid items-center shadow-xl border border-white/5 hover:border-white/10 transition-colors"
                :style="section.gridStyle">
                
                <div class="flex flex-col pr-2">
                    <span class="text-sm xs:text-base font-black uppercase tracking-tight text-white">{{ item.nombre }}</span>
                    <span class="text-[10px] text-gray-400 leading-relaxed italic mt-1">{{ item.ingredientes }}</span>
                </div>

                <!-- Multiple Price Columns support -->
                <div v-for="(col, i) in section.columns" :key="col.key" class="text-sm xs:text-xl font-black text-center"
                     :class="[i === 0 ? 'text-neon-green' : i === 1 ? 'text-neon-pink' : 'text-neon-cyan']">
                    ${{ item[col.key] }}
                </div>
            </li>
        </ul>
    </div>

    <!-- Sticky Order Bar (Bottom) - Essential for non-tech users -->
    <div v-if="rawSettings.contact?.whatsapp || rawSettings.contact?.phone" 
         class="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-2xl border-t border-white/10 p-4 sm:p-6 z-[60] flex flex-col sm:flex-row items-center justify-center gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <p class="orbitron text-[10px] sm:text-xs text-white uppercase font-black tracking-widest text-center sm:text-left">
            <span class="text-neon-pink">●</span> Realiza tu pedido ahora:
        </p>
        <div class="flex gap-3 w-full sm:w-auto">
            <a v-if="rawSettings.contact?.whatsapp" 
               :href="'https://wa.me/' + rawSettings.contact.whatsapp" 
               target="_blank"
               class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase hover:scale-105 active:scale-95 transition-all shadow-lg">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
            </a>
            <a v-if="rawSettings.contact?.phone" 
               :href="'tel:' + rawSettings.contact.phone" 
               class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase border border-white/20 hover:bg-white/20 transition-all shadow-lg">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Llamar
            </a>
        </div>
    </div>
  </div>
</template>

<style>
@keyframes spin-reverse {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
}
.animate-spin-reverse {
    animation: spin-reverse 1.5s linear infinite;
}
</style>
