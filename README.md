# Carta Digital Dinámica

Este proyecto es una aplicación web moderna (SPA) para digitalizar la carta de un restaurante, construida con **Vue 3**, **Vite**, **Tailwind CSS** y **Firebase**. 

Permite visualizar el menú de forma interactiva y gestionarlo en tiempo real a través de un panel de administración protegido.

## 🚀 Tecnologías
- **Vue 3 (Composition API)**: Framework principal.
- **Tailwind CSS**: Estilizado responsivo y moderno con estética neón.
- **Firebase Realtime Database**: Base de datos NoSQL para actualizaciones instantáneas sin recargar la página.
- **Firebase Authentication**: Seguridad para el acceso al panel de administración.
- **Vue Router**: Gestión de rutas (Home, Login, Admin).

## 🛠️ Instalación y Desarrollo
1. Descarga o clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📦 Despliegue (GitHub Pages)
Para generar los archivos de producción:
```bash
npm run build
```
Los archivos se generarán en la carpeta `dist/`. Sube el contenido de esa carpeta a tu rama de `gh-pages` o configúrala para servir desde ahí. El proyecto ya está configurado con `base: './'` en `vite.config.js` para funcionar correctamente en subrutas de GitHub.

## 🔐 Administración
- Accede a `/admin` para gestionar el menú.
- El sistema te redirigirá a `/login` si no has iniciado sesión.
- **Funcionalidades del Admin**:
  - Activar/Desactivar productos.
  - Editar nombres, ingredientes y precios (se guarda automáticamente al salir del campo).
  - Agregar o eliminar productos y secciones enteras.
  - Crear columnas de precios personalizadas por sección.
  - Importar datos originales desde los archivos JSON locales en caso de error.

## 📝 Notas de Configuración
La configuración de Firebase se encuentra en `src/firebase.js`. Actualmente utiliza una configuración por defecto, pero puedes sobrescribirla de forma persistente desde el código o mediante `localStorage` si fuera necesario.
