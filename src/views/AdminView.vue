<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuData } from '../services/data'
import { getFirebaseAuth } from '../firebase'
import { signOut } from 'firebase/auth'

const { subscribeToMenu, saveMenu, updateItem } = useMenuData()
const router = useRouter()

const items = ref({})
const menuSettings = ref({})
const loading = ref(true)
const newSectionName = ref('')
const notification = ref('')
let unsubscribeCursor = null

// Drag & Drop State
const draggedIndex = ref(null) // For sections
const draggedItemIndex = ref(null) // For items
const itemSourceCategory = ref(null) // For items
let scrollInterval = null

const processData = (data) => {
    menuSettings.value = data._settings || {}
    const dynamicItems = {}
    for (const [key, list] of Object.entries(data)) {
        if (key === '_settings') continue
        dynamicItems[key] = list ? list.map(item => ({ ...item, visible: item.visible !== false })) : []
    }
    items.value = dynamicItems
    
    // Auto-initialize sectionOrder if missing
    if (!menuSettings.value.sectionOrder || menuSettings.value.sectionOrder.length === 0) {
        menuSettings.value.sectionOrder = Object.keys(items.value)
    } else {
        const currentKeys = Object.keys(items.value)
        currentKeys.forEach(k => {
            if (!menuSettings.value.sectionOrder.includes(k)) {
                menuSettings.value.sectionOrder.push(k)
            }
        })
        menuSettings.value.sectionOrder = menuSettings.value.sectionOrder.filter(k => currentKeys.includes(k))
    }

    // Auto-initialize contact if missing
    if (!menuSettings.value.contact) {
        menuSettings.value.contact = { whatsapp: '', phone: '' }
    }

    loading.value = false
}

const sortedSections = computed(() => {
    const order = menuSettings.value.sectionOrder || []
    return order.map(key => ({
        key,
        list: items.value[key] || []
    })).filter(s => items.value[s.key])
})

// Drag & Drop Handlers
const handleDragStart = (index) => {
    draggedIndex.value = index
}

const handleDragOver = (event) => {
    event.preventDefault()
    
    // Auto-scroll logic
    const scrollThreshold = 100
    const scrollSpeed = 15
    const { clientY } = event
    const { innerHeight } = window

    clearInterval(scrollInterval)

    if (clientY < scrollThreshold) {
        // Scroll Up
        scrollInterval = setInterval(() => {
            window.scrollBy(0, -scrollSpeed)
        }, 16)
    } else if (clientY > innerHeight - scrollThreshold) {
        // Scroll Down
        scrollInterval = setInterval(() => {
            window.scrollBy(0, scrollSpeed)
        }, 16)
    }
}

const clearScroll = () => {
    clearInterval(scrollInterval)
}

const handleDrop = async (targetIndex) => {
    clearScroll()
    if (draggedIndex.value === null || draggedIndex.value === targetIndex) return
    
    const newOrder = [...menuSettings.value.sectionOrder]
    const itemToMove = newOrder.splice(draggedIndex.value, 1)[0]
    newOrder.splice(targetIndex, 0, itemToMove)
    
    menuSettings.value.sectionOrder = newOrder
    draggedIndex.value = null
    
    await handleSettingSave()
    showNotification("Orden actualizado")
}

const moveSection = async (index, direction) => {
    const newOrder = [...menuSettings.value.sectionOrder]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newOrder.length) return
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]
    menuSettings.value.sectionOrder = newOrder
    
    await handleSettingSave()
    showNotification("Orden actualizado")
}

// Item Drag & Drop Handlers
const handleItemDragStart = (category, index) => {
    draggedItemIndex.value = index
    itemSourceCategory.value = category
}

const handleItemDrop = async (category, targetIndex) => {
    clearScroll()
    if (draggedItemIndex.value === null || itemSourceCategory.value !== category || draggedItemIndex.value === targetIndex) return
    
    const list = items.value[category]
    const [movedItem] = list.splice(draggedItemIndex.value, 1)
    list.splice(targetIndex, 0, movedItem)
    
    draggedItemIndex.value = null
    itemSourceCategory.value = null
    
    await handleSettingSave()
    showNotification("Orden de productos actualizado")
}

const moveItem = async (category, index, direction) => {
    const list = items.value[category]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= list.length) return
    
    [list[index], list[targetIndex]] = [list[targetIndex], list[index]]
    
    await handleSettingSave()
    showNotification("Orden actualizado")
}

const showNotification = (msg) => {
    notification.value = msg
    setTimeout(() => notification.value = '', 3000)
}

const handleSettingSave = async () => {
    try {
        const fullData = { ...items.value, _settings: menuSettings.value }
        await saveMenu(fullData)
    } catch (e) {
        console.error("Save failed", e)
    }
}

const handleSettingBlur = async () => {
    await handleSettingSave()
    showNotification("Configuración guardada")
}

const handleInputBlur = async (category, idx) => {
    try {
        await updateItem(category, idx, { ...items.value[category][idx] })
    } catch (e) {
        console.error("Autosave failed", e)
    }
}

const toggleVisibility = async (category, idx, currentValue) => {
    const newValue = !currentValue
    items.value[category][idx].visible = newValue
    try {
        await updateItem(category, idx, { ...items.value[category][idx] })
        showNotification(newValue ? "Producto Activado" : "Producto Oculto")
    } catch (e) {
        items.value[category][idx].visible = currentValue
        alert("Error actualizando: " + e.message)
    }
}

const deleteItem = async (category, idx) => {
    if(!confirm("¿Eliminar este producto permanentemente?")) return
    items.value[category].splice(idx, 1)
    try {
        await handleSettingSave()
        showNotification("Producto Eliminado")
    } catch (e) {
        alert("Error borrando: " + e.message)
    }
}

const handleLogout = async () => {
    const auth = getFirebaseAuth()
    await signOut(auth)
    router.push('/login')
}

const addSection = async () => {
    if (!newSectionName.value) return
    const key = newSectionName.value.toLowerCase().replace(/\s+/g, '_')
    if (items.value[key]) {
        alert("Esa sección ya existe")
        return
    }
    items.value[key] = []
    menuSettings.value[key] = { columns: [{ key: 'precio', label: 'Precio' }] }
    
    if (!menuSettings.value.sectionOrder) menuSettings.value.sectionOrder = []
    menuSettings.value.sectionOrder.push(key)
    
    newSectionName.value = ''
    await handleSettingSave()
    showNotification("Sección creada")
}

const deleteSection = async (key) => {
    if (confirm(`PELIGRO: ¿Eliminar sección "${key}"? Esta acción no se puede deshacer.`)) {
        delete items.value[key]
        delete menuSettings.value[key]
        menuSettings.value.sectionOrder = menuSettings.value.sectionOrder.filter(k => k !== key)
        await handleSettingSave()
        showNotification("Sección eliminada")
    }
}

const getColumns = (category) => {
    return menuSettings.value[category]?.columns || [{ key: 'precio', label: 'Precio' }]
}

const removeColumn = async (category, idx) => {
    if (menuSettings.value[category].columns.length <= 1) {
        alert("Debe haber al menos 1 columna de precio")
        return
    }
    if (confirm("¿Eliminar esta columna? Se perderán los datos en todos los items.")) {
        menuSettings.value[category].columns.splice(idx, 1)
        await handleSettingSave()
        showNotification("Columna eliminada")
    }
}

const addColumn = async (category) => {
    const name = prompt("Nombre de nueva columna:")
    if (!name) return
    const key = name.toLowerCase().replace(/\s+/g, '_')
    if (!menuSettings.value[category]) {
        menuSettings.value[category] = { columns: [{ key: 'precio', label: 'Precio' }] }
    }
    menuSettings.value[category].columns.push({ key, label: name })
    await handleSettingSave()
    showNotification("Columna agregada")
}

const importFromJson = async (category) => {
    if (!confirm(`¿Reiniciar ${category} con datos originales?`)) return
    try {
        const paths = {
            completos: '/data_menu/completos.json',
            empanadas: '/data_menu/empanadas.json',
            sandwich: '/data_menu/sandwich.json',
            bebestibles: '/data_menu/bebestibles.json'
        }
        
        // Define default column structures for standard categories
        const defaultColumns = {
            completos: [
                { key: 'salchicha', label: 'Salchicha' },
                { key: 'mechada', label: 'Mechada' },
                { key: 'champinon', label: 'Champiñón' }
            ],
            sandwich: [
                { key: 'churrasco', label: 'Churrasco' },
                { key: 'mechada', label: 'Mechada' }
            ],
            empanadas: [{ key: 'precio', label: 'Precio' }],
            bebestibles: [{ key: 'precio', label: 'Precio' }]
        }

        const res = await fetch(paths[category])
        const json = await res.json()
        
        // Update items
        items.value[category] = (json[category] || []).map(item => ({ ...item, visible: true }))
        
        // Restore correct columns if it's a standard category
        if (defaultColumns[category]) {
            menuSettings.value[category] = { 
                ...menuSettings.value[category],
                columns: defaultColumns[category] 
            }
        }

        await handleSettingSave()
        showNotification(`${category} reiniciado con sus precios originales`)
    } catch (e) {
        alert("Error: " + e.message)
    }
}

const addItem = async (category) => {
    const colKey = getColumns(category)[0].key
    const newItem = { visible: true, nombre: 'Nuevo Item', ingredientes: '', [colKey]: '0' }
    items.value[category].push(newItem)
    await handleSettingSave()
    showNotification("Item Agregado")
}

onMounted(() => {
    unsubscribeCursor = subscribeToMenu((data) => {
        processData(data)
    })
})

onUnmounted(() => {
    if (unsubscribeCursor) unsubscribeCursor()
    clearScroll()
})
</script>

<template>
  <div class="min-h-screen bg-menu-base p-4 sm:p-8 text-white orbitron">
    <div v-if="notification" class="fixed top-24 right-4 sm:right-8 bg-neon-green text-black px-6 py-3 rounded-xl shadow-2xl z-[100] animate-bounce font-bold text-sm sm:text-base">
        {{ notification }}
    </div>

    <div class="max-w-7xl mx-auto" @dragend="clearScroll">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 class="monoton text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Admin Carta</h1>
            <p class="text-neon-green text-xs sm:text-sm flex items-center gap-2">● Sincronización Realtime</p>
        </div>
        <div class="flex gap-2 sm:gap-4 w-full sm:w-auto">
             <router-link to="/" class="flex-1 sm:flex-none text-center bg-menu-item px-4 py-2 rounded-xl hover:bg-purple-800 transition text-sm">Ver Menú</router-link>
            <button @click="handleLogout" class="flex-1 sm:flex-none bg-red-500/20 text-red-300 border border-red-500/50 px-4 py-2 rounded-xl hover:bg-red-500/40 transition text-sm">Salir</button>
        </div>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32 space-y-6">
        <div class="relative">
            <!-- Outer Ring -->
            <div class="w-16 h-16 border-4 border-white/5 border-t-neon-pink rounded-full animate-spin"></div>
            <!-- Inner Ring -->
            <div class="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-neon-green rounded-full animate-spin-reverse"></div>
        </div>
        <p class="text-gray-500 uppercase tracking-widest text-[10px] font-bold animate-pulse">Sincronizando con la nube...</p>
      </div>

      <div v-else class="space-y-8 sm:space-y-12">
        <div class="grid grid-cols-1 gap-6 mb-8">
            <!-- Sección 1: Datos del Sitio -->
            <div class="bg-black/40 p-6 rounded-[2rem] border border-white/10 shadow-xl space-y-4">
                <h3 class="orbitron text-xs font-black uppercase tracking-widest text-neon-pink mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 bg-neon-pink rounded-full animate-pulse"></span>
                    Datos del Sitio
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-[9px] text-gray-500 uppercase ml-1 font-bold">Título de la Carta</label>
                        <input v-model="menuSettings.siteTitle" @blur="handleSettingBlur" placeholder="Ej: Mi Restaurant" class="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neon-pink transition">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-[9px] text-gray-500 uppercase ml-1 font-bold">WhatsApp Pedidos</label>
                        <input v-model="menuSettings.contact.whatsapp" @blur="handleSettingBlur" placeholder="56912345678" class="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green transition">
                    </div>
                    <div class="flex flex-col gap-1 md:col-span-2">
                        <label class="text-[9px] text-gray-500 uppercase ml-1 font-bold">Teléfono Llamadas</label>
                        <input v-model="menuSettings.contact.phone" @blur="handleSettingBlur" placeholder="221234567" class="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan transition">
                    </div>
                </div>
            </div>

            <!-- Sección 2: Estructura del Menú -->
            <div class="bg-black/40 p-6 rounded-[2rem] border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                    <h3 class="orbitron text-xs font-black uppercase tracking-widest text-neon-green mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                        Opciones de Secciones
                    </h3>
                    <div class="flex flex-col gap-1">
                        <label class="text-[9px] text-gray-500 uppercase ml-1 font-bold">Crear Nueva Sección</label>
                        <div class="flex gap-2">
                            <input v-model="newSectionName" placeholder="Ej: Postres" class="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white transition">
                            <button @click="addSection" class="bg-white/10 border border-white/20 px-6 py-2.5 rounded-xl hover:bg-white/20 transition font-black text-xs uppercase tracking-widest">Crear</button>
                        </div>
                    </div>
                </div>
                <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3 mt-4">
                    <span class="text-neon-cyan">ℹ️</span>
                    <p class="text-[10px] text-gray-400 italic leading-relaxed">
                        Puedes reordenar las secciones arrastrando desde el icono de los puntos (⠿) de cada tarjeta.
                    </p>
                </div>
            </div>
        </div>

        <!-- Draggable Sections -->
        <div v-for="(section, sIdx) in sortedSections" 
             :key="section.key" 
             class="bg-black/30 p-4 sm:p-6 rounded-[2rem] border border-white/5 relative group transition-all duration-300 overflow-visible"
             :class="{ 'opacity-50 scale-[0.98] border-neon-cyan/50': draggedIndex === sIdx }"
             @dragover="handleDragOver"
             @drop="handleDrop(sIdx)">
          
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div class="flex items-center gap-3">
                <!-- Drag Handle -->
                <div draggable="true" 
                     @dragstart="handleDragStart(sIdx)"
                     class="cursor-grab active:cursor-grabbing p-2 text-gray-600 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
                        <circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
                    </svg>
                </div>

                <div class="flex flex-col gap-1 sm:hidden">
                    <button @click="moveSection(sIdx, -1)" class="text-[10px] hover:text-neon-green">▲</button>
                    <button @click="moveSection(sIdx, 1)" class="text-[10px] hover:text-neon-pink">▼</button>
                </div>

                <h2 class="text-xl sm:text-2xl capitalize font-bold text-white">{{ section.key }}</h2>
                <button @click="addColumn(section.key)" class="text-[10px] bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 px-2 py-0.5 rounded-full hover:bg-neon-cyan/30 transition opacity-0 group-hover:opacity-100">+ Columna</button>
            </div>
            
            <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto justify-end">
                <span class="text-[10px] sm:text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{{ section.list.length }} items</span>
                <button v-if="['completos','empanadas','sandwich','bebestibles'].includes(section.key)" @click="importFromJson(section.key)" class="text-[10px] text-neon-cyan/80 hover:text-white border border-neon-cyan/20 px-2 py-1 rounded-lg hover:bg-neon-cyan/10">Reiniciar</button>
                <button @click="deleteSection(section.key)" class="text-[10px] text-red-500/80 hover:text-red-400 border border-red-500/20 px-2 py-1 rounded-lg hover:bg-red-500/10 transition">Eliminar</button>
            </div>
          </div>

          <div class="hidden sm:block overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/10">
                  <th class="p-3 w-10"></th>
                  <th class="p-3 w-16 text-center">👁️</th>
                  <th class="p-3 w-48">Nombre</th>
                  <th class="p-3">Ingredientes</th>
                  <th v-for="(col, colIdx) in getColumns(section.key)" :key="colIdx" class="p-3 w-32 text-center group/th relative">
                      <div class="flex items-center justify-center gap-1 group">
                          <span>{{ col.label }}</span>
                          <button @click="removeColumn(section.key, colIdx)" class="text-red-500 font-bold opacity-0 group-hover:opacity-100 hover:scale-125 transition">×</button>
                      </div>
                  </th>
                  <th class="p-3 w-12 text-center">🗑️</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in section.list" :key="idx" 
                    class="border-b border-white/5 hover:bg-white/5 transition group/tr"
                    :class="{ 'opacity-50 bg-white/10': draggedItemIndex === idx && itemSourceCategory === section.key }"
                    @dragover="handleDragOver"
                    @drop.stop="handleItemDrop(section.key, idx)">
                  <td class="p-2">
                     <div draggable="true" @dragstart="handleItemDragStart(section.key, idx)" class="cursor-grab active:cursor-grabbing text-gray-700 hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="9" cy="6" r="1"></circle><circle cx="15" cy="6" r="1"></circle><circle cx="9" cy="18" r="1"></circle><circle cx="15" cy="18" r="1"></circle></svg>
                     </div>
                  </td>
                  <td class="p-3 text-center">
                    <input type="checkbox" :checked="item.visible" @change="toggleVisibility(section.key, idx, item.visible)" class="w-5 h-5 accent-neon-green cursor-pointer rounded-lg">
                  </td>
                  <td class="p-4"><input v-model="item.nombre" @blur="handleInputBlur(section.key, idx)" class="bg-black/20 border border-transparent focus:border-neon-pink/50 p-2 rounded-lg w-full focus:outline-none text-white text-sm transition"></td>
                  <td class="p-4"><input v-model="item.ingredientes" @blur="handleInputBlur(section.key, idx)" class="bg-black/20 border border-transparent focus:border-neon-pink/50 p-2 rounded-lg w-full focus:outline-none text-xs text-gray-400 transition"></td>
                  <td v-for="col in getColumns(section.key)" :key="col.key" class="p-4">
                      <input v-model="item[col.key]" @blur="handleInputBlur(section.key, idx)" class="bg-black/20 border border-transparent focus:border-neon-green/50 p-2 rounded-lg w-full text-center focus:outline-none text-sm transition font-bold text-neon-green">
                  </td>
                  <td class="p-3 text-center">
                    <div class="flex items-center gap-1 opacity-0 group-hover/tr:opacity-100 transition-opacity">
                        <button @click="deleteItem(section.key, idx)" class="text-red-500/50 hover:text-red-500 px-2 transition font-bold">✕</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="sm:hidden space-y-4">
            <div v-for="(item, idx) in section.list" :key="idx" 
                 class="bg-black/40 border border-white/10 p-4 rounded-xl relative"
                 @dragover="handleDragOver"
                 @drop.stop="handleItemDrop(section.key, idx)">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <!-- Item Drag Handle Mobile -->
                        <div draggable="true" @dragstart="handleItemDragStart(section.key, idx)" class="cursor-grab p-1 text-gray-700">
                           <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="9" cy="6" r="1"></circle><circle cx="15" cy="6" r="1"></circle><circle cx="9" cy="18" r="1"></circle><circle cx="15" cy="18" r="1"></circle></svg>
                        </div>
                        <div class="flex flex-col">
                            <button @click="moveItem(section.key, idx, -1)" class="text-[8px] hover:text-neon-pink">▲</button>
                            <button @click="moveItem(section.key, idx, 1)" class="text-[8px] hover:text-neon-pink">▼</button>
                        </div>
                        <input type="checkbox" :checked="item.visible" @change="toggleVisibility(section.key, idx, item.visible)" class="w-6 h-6 accent-neon-green">
                        <span class="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{{ item.visible ? 'VISIBLE' : 'OCULTO' }}</span>
                    </div>
                    <button @click="deleteItem(section.key, idx)" class="bg-red-500/20 text-red-500 p-2 rounded-xl">✕</button>
                </div>
                <div class="space-y-3">
                    <div><label class="text-[9px] text-gray-500 uppercase ml-1">Nombre</label><input v-model="item.nombre" @blur="handleInputBlur(section.key, idx)" class="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-1 focus:ring-neon-pink outline-none text-sm font-bold"></div>
                    <div><label class="text-[9px] text-gray-500 uppercase ml-1">Ingredientes</label><textarea v-model="item.ingredientes" @blur="handleInputBlur(section.key, idx)" class="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-1 focus:ring-neon-pink outline-none text-xs text-gray-400 h-16"></textarea></div>
                    <div class="grid grid-cols-2 gap-2">
                        <div v-for="col in getColumns(section.key)" :key="col.key">
                             <label class="text-[9px] text-gray-500 uppercase ml-1">{{ col.label }}</label>
                             <input v-model="item[col.key]" @blur="handleInputBlur(section.key, idx)" class="w-full bg-black/30 border border-neon-green/30 p-3 rounded-xl focus:ring-1 focus:ring-neon-green outline-none text-sm font-bold text-center text-neon-green" placeholder="$0">
                        </div>
                    </div>
                </div>
            </div>
          </div>
          <button @click="addItem(section.key)" class="mt-6 w-full py-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-neon-pink/30 hover:bg-neon-pink/5 text-gray-500 hover:text-neon-pink transition-all font-bold flex items-center justify-center gap-2">
                <span class="text-xl">+</span> Agregar Producto
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
@keyframes spin-reverse {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
}
.animate-spin-reverse {
    animation: spin-reverse 1.5s linear infinite;
}
</style>
