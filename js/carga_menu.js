  // Función para cargar y renderizar el menú
        async function loadMenu() {
            try {
                // Asumiendo que tu archivo se llama menu.json en la misma carpeta
                const json_completos = await fetch('./data_menu/completos.json');
                const json_empanadas = await fetch('./data_menu/empanadas.json');
                const json_bebestibles = await fetch('./data_menu/bebestibles.json');
                const data_completos = await json_completos.json();
                const data_empanadas = await json_empanadas.json();
                const data_bebestibles = await json_bebestibles.json();

                const container_completos = document.getElementById('menu-completos');
                const container_empanadas = document.getElementById('menu-empanadas');
                const container_bebestibles = document.getElementById('menu-bebestibles');
                // Mapeo de datos al HTML
                container_completos.innerHTML = data_completos.completos.map(item => `
                    <li class="bg-menu-item rounded-2xl p-3 grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center shadow-lg border border-white/5">
                        <div class="flex flex-col pr-1">
                            <span class="text-sm xs:text-lg font-bold uppercase tracking-tight leading-none">${item.nombre}</span>
                            <span class="text-[11px] text-gray-300 leading-tight">${item.ingredientes}</span>
                        </div>
                        <div class="text-sm xs:text-xl font-bold text-neon-green text-center">$${item.salchicha}</div>
                        <div class="text-sm xs:text-xl font-bold text-neon-pink text-center">$${item.mechada}</div>
                        <div class="text-sm xs:text-xl font-bold text-neon-cyan text-center">$${item.champinon}</div>
                    </li>
                `).join('');

                container_empanadas.innerHTML = data_empanadas.empanadas.map(item => `
                    <li class="bg-menu-item rounded-2xl p-3 grid grid-cols-[1.5fr_1fr] items-center shadow-lg border border-white/5">
                        <div class="flex flex-col pr-1">
                            <span class="text-sm xs:text-lg font-bold uppercase tracking-tight leading-none">${item.nombre}</span>
                            <span class="text-[11px] text-gray-300 leading-tight">${item.ingredientes}</span>
                        </div>
                        <div class="text-sm xs:text-xl font-bold text-neon-green text-end">$${item.precio}</div>

                    </li>
                `).join('');
                container_bebestibles.innerHTML = data_bebestibles.bebestibles.map(item => `
                    <li class="bg-menu-item rounded-2xl p-3 grid grid-cols-[1.5fr_1fr] items-center shadow-lg border border-white/5">
                        <div class="flex flex-col pr-1">
                            <span class="text-sm xs:text-lg font-bold uppercase tracking-tight leading-none">${item.nombre}</span>
                            <span class="text-[11px] text-gray-300 leading-tight">${item.ingredientes}</span>
                        </div>
                        <div class="text-sm xs:text-xl font-bold text-neon-green text-end">$${item.precio}</div>

                    </li>
                `).join('');
            } catch (error) {
                console.error("Error cargando el menú:", error);
            }
        }

        // Ejecutar carga al iniciar
        loadMenu();