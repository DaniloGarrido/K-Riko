# Carta Digital Dinámica 🍽️✨

Este proyecto es una aplicación web moderna (SPA) para digitalizar la carta de un restaurante, diseñada para ser rápida, visualmente atractiva y fácil de administrar en tiempo real.

## 🚀 Tecnologías
- **Vue 3 (Composition API)**: Framework principal para una interfaz reactiva.
- **Vite**: Herramienta de construcción ultra rápida.
- **Tailwind CSS**: Diseño personalizado, responsivo y con estética neón premium.
- **Firebase Realtime Database**: Sincronización instantánea de datos entre el admin y los clientes.
- **Firebase Authentication**: Acceso seguro al panel de administración.
- **GitHub Actions**: Despliegue automatizado y seguro.

---

## 🛠️ Configuración Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   - Crea un archivo `.env` en la raíz del proyecto.
   - Copia el contenido de `.env.example` y completa con tus credenciales de Firebase.
   - *Nota: Vite requiere que las variables empiecen con `VITE_`.*

3. **Desarrollo**:
   ```bash
   npm run dev
   ```

---

## 📦 Despliegue en GitHub Pages (Método Seguro)

Este proyecto está configurado para desplegarse automáticamente cada vez que hagas un `push` a la rama `main` usando GitHub Actions. **No es necesario subir el archivo `.env`**.

### Pasos para el primer despliegue:

#### 1. Configurar Secrets en GitHub
Para que GitHub pueda construir tu sitio sin exponer tus claves de Firebase, debes agregarlas como "Secrets":
1. Ve a tu repositorio en GitHub > **Settings** > **Secrets and variables** > **Actions**.
2. Haz clic en **New repository secret**.
3. Añade los siguientes 8 secretos con sus respectivos valores de tu Firebase:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

#### 2. Activar GitHub Actions para Pages
1. En **Settings** > **Pages**.
2. En la sección **Build and deployment** > **Source**, selecciona **GitHub Actions**.

#### 3. ¡Listo!
Ahora, simplemente sube tus cambios:
```bash
git add .
git commit -m "Configuración de despliegue"
git push origin main
```
El sitio se construirá y publicará automáticamente en un par de minutos. Podrás ver el progreso en la pestaña **Actions** de tu repositorio.

---

## 🔐 Panel de Administración
- Acceso: `tu-url.com/admin`.
- **Funcionalidades**:
  - **Sincronización Realtime**: Los cambios se ven en la carta del cliente al instante.
  - **Drag & Drop**: Reordena secciones y productos arrastrando el icono `⠿`.
  - **Auto-guardado**: Edita cualquier campo y se guardará automáticamente al perder el foco (on blur).
  - **Gestión Estructural**: Crea/Elimina secciones y añade múltiples columnas de precios por categoría.
  - **WhatsApp/Llamadas**: Configura el contacto directo para pedidos desde el panel global.
  - **Recuperación**: Botón de "Reiniciar" para restaurar secciones desde los JSON originales si es necesario.

---

## 🎨 Diseño y Personalización
El diseño utiliza una paleta de colores neón configurada en `tailwind.config.js`. Puedes ajustar los colores básicos como `neon-pink`, `neon-green`, `neon-cyan` y `neon-purple` para cambiar la estética global del sitio.
