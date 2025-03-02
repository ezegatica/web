let devMode = false;

const patente = {
    "AA": "SANTA SEDE",
    "AC": "REPÚBLICA FEDERAL DE ALEMANIA",
    "AD": "REPÚBLICA DE ANGOLA",
    "AE": "REINO DE ARABIA SAUDITA",
    "AF": "REPÚBLICA ARGELINA DEMOCRÁTICA Y POPULAR",
    "AG": "REPÚBLICA DE ARMENIA",
    "AH": "MANCOMUNIDAD DE AUSTRALIA",
    "AI": "REPÚBLICA DE AUSTRIA",
    "AJ": "REPÚBLICA DE BELARÚS",
    "AK": "REINO DE BÉLGICA",
    "AL": "ESTADO PLURINACIONAL DE BOLIVIA",
    "AM": "REPÚBLICA FEDERATIVA DEL BRASIL",
    "AN": "REPÚBLICA DE BULGARIA",
    "AO": "CANADÁ",
    "AP": "REPÚBLICA CHECA",
    "AQ": "REPÚBLICA DE CHILE",
    "AR": "REPÚBLICA POPULAR CHINA",
    "AS": "REPÚBLICA DE COLOMBIA",
    "AT": "REPÚBLICA DEMOCRÁTICA DEL CONGO",
    "AU": "REPÚBLICA DE COREA",
    "AV": "REPÚBLICA DE COSTA RICA",
    "AW": "REPÚBLICA DE CROACIA",
    "AX": "REPÚBLICA DE CUBA",
    "AY": "REINO DE DINAMARCA",
    "AZ": "REPÚBLICA DOMINICANA",
    "BA": "REPÚBLICA DEL ECUADOR",
    "BB": "REPÚBLICA ÁRABE DE EGIPTO",
    "BC": "REPÚBLICA DE EL SALVADOR",
    "BD": "EMIRATOS ÁRABES UNIDOS",
    "BE": "REPÚBLICA ESLOVACA",
    "BF": "REPÚBLICA DE ESLOVENIA",
    "BG": "REINO DE ESPAÑA",
    "BH": "ESTADOS UNIDOS DE AMÉRICA",
    "BI": "REPÚBLICA DE FILIPINAS",
    "BJ": "REPÚBLICA DE FINLANDIA",
    "BK": "REPÚBLICA FRANCESA",
    "BL": "REPÚBLICA HELÉNICA",
    "BM": "REPÚBLICA DE GUATEMALA",
    "BN": "REPÚBLICA DE HAITÍ",
    "BO": "REPÚBLICA DE HONDURAS",
    "BP": "HUNGRÍA",
    "BQ": "REPÚBLICA DE LA INDIA",
    "BR": "REPÚBLICA DE INDONESIA",
    "BS": "REPÚBLICA ISLÁMICA DE IRÁN",
    "BT": "IRLANDA",
    "BU": "ESTADO DE ISRAEL",
    "BV": "REPÚBLICA ITALIANA",
    "BW": "JAPÓN",
    "BX": "ESTADO DE KUWAIT",
    "BY": "REPÚBLICA LIBANESA",
    "BZ": "ESTADO DE LIBIA",
    "CB": "MALASIA",
    "CC": "SOBERANA ORDEN MILITAR DE MALTA",
    "CD": "REINO DE MARRUECOS",
    "CE": "ESTADOS UNIDOS MEXICANOS",
    "CF": "REPÚBLICA DE NICARAGUA",
    "CG": "REPÚBLICA FEDERAL DE NIGERIA",
    "CH": "REINO DE NORUEGA",
    "CI": "NUEVA ZELANDIA",
    "CJ": "REINO DE LOS PAÍSES BAJOS",
    "CK": "REPÚBLICA ISLÁMICA DE PAKISTÁN",
    "CL": "REPÚBLICA DE PANAMÁ",
    "CM": "REPÚBLICA DEL PARAGUAY",
    "CN": "REPÚBLICA DEL PERÚ",
    "CO": "REPÚBLICA DE POLONIA",
    "CP": "REPÚBLICA PORTUGUESA",
    "CQ": "REINO UNIDO DE GRAN BRETAÑA E IRLANDA DEL NORTE",
    "CR": "RUMANIA",
    "CS": "FEDERACIÓN DE RUSIA",
    "CU": "REPÚBLICA DE SERBIA",
    "CV": "REPÚBLICA ÁRABE SIRIA",
    "CW": "REPÚBLICA DE SUDÁFRICA",
    "CX": "REINO DE SUECIA",
    "CY": "CONFEDERACIÓN SUIZA",
    "CZ": "REINO DE TAILANDIA",
    "DA": "REPÚBLICA TUNECINA",
    "DB": "REPÚBLICA DE TURQUÍA",
    "DC": "UCRANIA",
    "DD": "REPÚBLICA ORIENTAL DEL URUGUAY",
    "DE": "REPÚBLICA BOLIVARIANA DE VENEZUELA",
    "DF": "REPÚBLICA SOCIALISTA DE VIETNAM",
    "DG": "UNIÓN EUROPEA",
    "DH": "LIGA DE LOS ESTADOS ÁRABES",
    "DI": "ESTADO DE PALESTINA",
    "DJ": "REPÚBLICA DE AZERBAIYÁN",
    "DK": "GEORGIA",
    "DL": "ESTADO DE QATAR",
    "DM": "MONTENEGRO",
    "RA": "ALTO COMISIONADO DE LAS NACIONES UNIDAS PARA LOS REFUGIADOS",
    "RB": "BANCO INTERAMERICANO DE DESARROLLO",
    "RC": "BANCO INTERNACIONAL DE RECONSTRUCCIÓN Y DESARROLLO",
    "RD": "CENTRO DE INFORMACIÓN DE LAS NACIONES UNIDAS PARA ARGENTINA Y URUGUAY",
    "RE": "COMISIÓN ADMINISTRADORA DEL RIO DE LA PLATA",
    "RF": "COMISIÓN ADMINISTRADORA DEL RÍO URUGUAY",
    "RG": "COMISIÓN MIXTA ARGENTINO PARAGUAYA DEL RÍO PARANÁ",
    "RH": "COMITÉ INTERNACIONAL DE LA CRUZ ROJA",
    "RI": "CORPORACIÓN ANDINA DE FOMENTO",
    "RJ": "CORPORACIÓN FINANCIERA INTERNACIONAL",
    "RK": "ENTIDAD BINACIONAL YACIRETÁ",
    "RL": "FONDO DE LAS NACIONES UNIDAS PARA LA INFANCIA",
    "RM": "FONDO MONETARIO INTERNACIONAL",
    "RN": "INSTITUTO INTERAMERICANO DE COOPERACIÓN PARA LA AGRICULTURA",
    "RO": "ORGANIZACIÓN DE ESTADOS IBEROAMERICANOS PARA LA EDUCACIÓN, LA CIENCIA Y LA CULTURA",
    "RP": "ORGANIZACIÓN DE LAS NACIONES UNIDAS PARA LA AGRICULTURA Y LA ALIMENTACIÓN",
    "RQ": "ORGANIZACIÓN IBEROAMERICANO DE SEGURIDAD SOCIAL",
    "RR": "ORGANIZACIÓN INTERNACIONAL DE POLICIA CRIMINAL",
    "RS": "ORGANIZACIÓN INTERNACIONAL DEL TRABAJO",
    "RT": "ORGANIZACION INTERNACIONAL PARA LAS MIGRACIONES",
    "RU": "ORGANIZACIÓN PANAMERICANA DE LA SALUD - OPS/OMS",
    "RV": "PROGRAMA COMÚN DE LAS NACIONES UNIDAS SOBRE VIH/SIDA",
    "RW": "SISTEMA DE LAS NACIONES UNIDAS",
    "RX": "REPRES. SECRET. GRAL. OEA EN ARGENTINA",
    "RY": "SECRETARÍA DEL TRATADO ANTÁRTICO",
    "RZ": "FEDERACIÓN INTERNACIONAL DE SOCIEDADES DE LA CRUZ ROJA",
    "SA": "REPRESENTACIÓN REGIONAL PARA LAS AMÉRICAS DE LA ORGANIZACIÓN MUNDIAL DE SANIDAD ANIMAL",
    "SB": "OFICINA DE LAS NACIONES UNIDAS PARA LOS PROYECTOS",
    "SC": "CENTRO DE ESTUDIOS ESTRATÉGICOS DE DEFENSA DEL CONSEJO DE DEFENSA SURAMERICANO DEL UNASUR - CEED",
    "SD": "COMISIÓN TRINACIONAL PARA EL DESARROLLO DE LA CUENCA DEL RÍO PILCOMAYO",
    "SE": "COMISIÓN ECONÓMICA PARA AMÉRICA LATINA Y EL CARIBE - CEPAL",
    "XA": "AGENCIA DE COOPERACIÓN INTERNACIONAL DEL JAPÓN (JICA)",
    "XB": "FUNDACIÓN KONRAD ADENAUER",
    "XC": "FUNDACIÓN HANNS SEIDEL",
    "XD": "FUNDACIÓN FRIEDRICH NAUMANN",
    "XE": "FUNDACIÓN FRIEDRICH EBERT"
}

const categoria = {
    "D": "CUERPO DIPLOMATICO",
    "I": "ORGANISMO INTERNACIONAL",
    "C": "CUERPO CONSULAR",
    "A": "PERSONAL ADMINISTRATIVO",
    "M": "MISION ESPECIAL"
}

function sanitizeInput(input) {
    // Clean and standardize input
    const patenteClean = input.toUpperCase().trim();

    // Prepare result object with default values
    const result = {
        input: patenteClean,
        codigo: null,
        pais: null,
        categoria: null,
        categoriaTraduccion: null,
        usoJefe: false,
        esPatenteCompleta: false,
        error: null
    };

    // Check if input is exactly a 2-letter country code
    if (patenteClean.length === 2 && /^[A-Z]{2}$/.test(patenteClean)) {
        result.codigo = patenteClean;
        result.pais = patente[patenteClean];

        if (!result.pais) {
            result.error = "Código de país no encontrado";
        }

        return result;
    }

    // Check if input is a complete diplomatic plate (format: D000XXA)
    const patenteCompletaRegex = /^[A-Z]{1}\d{3}[A-Z]{3}$/;
    if (patenteCompletaRegex.test(patenteClean)) {
        result.esPatenteCompleta = true;

        // Extract parts
        const categoriaChar = patenteClean.charAt(0);
        const paisStr = patenteClean.substring(4, 6);

        // Verify category
        result.categoriaTraduccion = categoriaChar;
        result.categoria = categoria[categoriaChar];

        if (!result.categoria) {
            result.error = "Categoría no encontrada";
            return result;
        }

        // Verify country code
        result.codigo = paisStr;
        result.pais = patente[paisStr];

        if (!result.pais) {
            result.error = "Código de país no encontrado";
            return result;
        }

        // Check if it's for chief of diplomatic mission use
        result.usoJefe = patenteClean[patenteClean.length - 1] === 'A';

        return result;
    }

    // If we got here, format is invalid
    result.error = "Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra";
    return result;
}

function clearSearchParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete('patente');
    window.history.replaceState({}, '', url);
}

function handleCapturar() {
    clearSearchParams();
    const patente = document.getElementById('patente').value;
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        addPatente(patente, lat, lon);
        document.getElementById('patente-detail-dialog').close(); // Close dialog after capturing
    }, (error) => {
        if (error.code === 1) {
            showError("Por favor, permita el acceso a la ubicación para poder capturar la patente");
        } else {
            console.error(error);
            showError("Error al obtener la ubicación");
        }
    });
}

function addPatente(patente, lat, lon) {
    const patentes = JSON.parse(localStorage.getItem('patentes')) || [];

    // Remove the check for duplicates to allow multiple captures of the same plate
    patentes.push({
        patente,
        lat,
        lon,
        date: new Date().toISOString()
    });
    localStorage.setItem('patentes', JSON.stringify(patentes));
    showInfoDialog("Éxito", "Patente capturada con éxito");

    actualizarLista();
}

function actualizarLista() {
    const patentes = JSON.parse(localStorage.getItem('patentes')) || [];
    const list = document.getElementById('patentes-capturadas');

    // Header with export/import buttons and dev buttons
    let buttonsHtml = `<button id='importar-btn' class="px-3 py-1 bg-primary-600 dark:bg-primary-700 text-white rounded hover:bg-primary-700 dark:hover:bg-primary-600 ml-2">Importar</button>`;

    if (patentes.length > 0) {
        buttonsHtml = `<button id='exportar-btn' class="px-3 py-1 bg-primary-600 dark:bg-primary-700 text-white rounded hover:bg-primary-700 dark:hover:bg-primary-600">Exportar</button> ${buttonsHtml}`;
    }

    if (devMode) {
        buttonsHtml += ` <button id='crear-btn' class="dev-button px-3 py-1 rounded hover:opacity-80 ml-2" style="background-color: var(--dev-background-color); border: 1px solid var(--dev-border-color); color: var(--dev-text-color);">Crear</button>`;
        if (patentes.length > 0) {
            buttonsHtml += ` <button id='eliminar-todo-btn' class="dev-button px-3 py-1 rounded hover:opacity-80 ml-2" style="background-color: var(--dev-background-color); border: 1px solid var(--dev-border-color); color: var(--dev-text-color);">Eliminar todo</button>`;
        }
    }

    if (patentes.length === 0) {
        list.innerHTML = `
            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div class="flex flex-wrap items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Patentes capturadas</h2>
                    <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">${buttonsHtml}</div>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-center py-8">No hay patentes capturadas</p>
            </div>
        `;
    } else {
        list.innerHTML = `
            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div class="flex flex-wrap items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Patentes capturadas (${patentes.length})</h2>
                    <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">${buttonsHtml}</div>
                </div>
                <ul class="divide-y divide-gray-200 dark:divide-gray-700" id="patentes-lista"></ul>
            </div>
        `;
    }

    // Add event listeners for buttons
    setTimeout(() => {
        const exportarBtn = document.getElementById('exportar-btn');
        const importarBtn = document.getElementById('importar-btn');
        const crearBtn = document.getElementById('crear-btn');
        const eliminarTodoBtn = document.getElementById('eliminar-todo-btn');

        if (exportarBtn) exportarBtn.addEventListener('click', exportarPatentes);
        if (importarBtn) importarBtn.addEventListener('click', mostrarImportarDialog);
        if (crearBtn) crearBtn.addEventListener('click', mostrarCrearPatenteDialog);
        if (eliminarTodoBtn) eliminarTodoBtn.addEventListener('click', confirmarEliminarTodo);
    }, 0);

    if (patentes.length === 0) {
        return;
    }

    const listElement = document.getElementById('patentes-lista');
    listElement.innerHTML = '';

    // Group patentes by their value
    const groupedPatentes = {};
    patentes.forEach((item, globalIndex) => {
        if (!groupedPatentes[item.patente]) {
            groupedPatentes[item.patente] = [];
        }
        // Store the original index in the global array for deletion purposes
        const enhancedItem = { ...item, globalIndex };
        groupedPatentes[item.patente].push(enhancedItem);
    });

    // Create list items for each group
    Object.keys(groupedPatentes).forEach((patenteValue) => {
        const patenteInstances = groupedPatentes[patenteValue];

        const li = document.createElement('li');
        li.classList.add('py-4');

        // Store all coordinates data as JSON in data attribute
        const locationData = JSON.stringify(patenteInstances.map(item => ({
            lat: item.lat,
            lon: item.lon,
            date: item.date
        })));

        // Create date selector - only if there are multiple captures
        let dateSelectHtml = '';
        if (patenteInstances.length > 1) {
            let dateOptions = `<option value="all" selected>Todas las fechas (${patenteInstances.length})</option>`;
            patenteInstances.forEach((instance, index) => {
                const formattedDate = new Date(instance.date).toLocaleString('es-AR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                dateOptions += `<option value="${index}" data-global-index="${instance.globalIndex}">${formattedDate}</option>`;
            });

            dateSelectHtml = `
                <div class="flex items-center mt-2">
                    <label for="date-select-${patenteValue}" class="text-sm text-gray-500 dark:text-gray-400 mr-2">Fecha:</label>
                    <select id="date-select-${patenteValue}" class="text-sm border border-gray-300 dark:border-gray-600 rounded py-1 px-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200" data-patente="${patenteValue}" data-locations='${locationData}'>
                        ${dateOptions}
                    </select>
                </div>
            `;
        } else if (patenteInstances.length === 1) {
            // If only one instance, show the date as text
            const formattedDate = new Date(patenteInstances[0].date).toLocaleString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            dateSelectHtml = `
                <div class="mt-2">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Fecha: ${formattedDate}</span>
                    <input type="hidden" id="date-select-${patenteValue}" value="${patenteInstances[0].globalIndex}" data-is-single="true">
                </div>
            `;
        }

        // Default buttons for all or one instance
        let buttonsHtml = `
            <div class="flex flex-wrap gap-2 mt-2" id="buttons-container-${patenteValue}">
                <button type="button" id="ver-detalle" data-patente="${patenteValue}" class="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-700/50 transition-colors">Ver detalle</button>
                <button type="button" id="ver-mapa" data-locations='${locationData}' data-patente="${patenteValue}" class="px-2 py-1 text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors">Ver en mapa</button>
                <button type="button" id="eliminar-grupo" data-patente="${patenteValue}" class="px-2 py-1 text-xs bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors">${patenteInstances.length > 1 ? 'Eliminar todos' : 'Eliminar'}</button>
                ${devMode && patenteInstances.length === 1 ? 
                    `<button type="button" id="editar" data-patente="${patenteInstances[0].patente}" data-lat="${patenteInstances[0].lat}" data-lon="${patenteInstances[0].lon}" class="dev-button px-2 py-1 text-xs rounded hover:opacity-80" style="background-color: var(--dev-background-color); border: 1px solid var(--dev-border-color); color: var(--dev-text-color);">Editar</button>` 
                    : ''}
            </div>
        `;

        li.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100">${patenteValue}</p>
                    ${dateSelectHtml}
                </div>
                <div class="mt-3 md:mt-0">
                    ${buttonsHtml}
                </div>
            </div>
        `;

        listElement.appendChild(li);

        // Add listener for date select change to update displayed data - only if multiple instances
        if (patenteInstances.length > 1) {
            const dateSelect = li.querySelector(`#date-select-${patenteValue}`);
            const buttonsContainer = li.querySelector(`#buttons-container-${patenteValue}`);

            dateSelect.addEventListener('change', function (e) {
                const selectedValue = e.target.value;
                const verMapaBtn = li.querySelector('#ver-mapa');
                const eliminarBtn = li.querySelector('#eliminar-grupo, #eliminar-individual');

                // Look for or create the edit button (only in dev mode)
                let editarBtn = li.querySelector('#editar');

                if (selectedValue !== 'all') {
                    // Get the specific instance data
                    const selectedIndex = parseInt(selectedValue);
                    const selectedInstance = patenteInstances[selectedIndex];

                    // Update map button to show only this location
                    verMapaBtn.dataset.locations = JSON.stringify([{
                        lat: selectedInstance.lat,
                        lon: selectedInstance.lon,
                        date: selectedInstance.date
                    }]);

                    // Change delete button to delete just this instance
                    eliminarBtn.id = 'eliminar-individual';
                    eliminarBtn.dataset.globalIndex = selectedInstance.globalIndex.toString();
                    eliminarBtn.textContent = 'Eliminar esta';

                    // Add edit button if in dev mode
                    if (devMode) {
                        if (!editarBtn) {
                            editarBtn = document.createElement('button');
                            editarBtn.id = 'editar';
                            editarBtn.className = 'dev-button px-2 py-1 text-xs rounded hover:opacity-80';
                            editarBtn.style.backgroundColor = 'var(--dev-background-color)';
                            editarBtn.style.borderColor = 'var(--dev-border-color)';
                            editarBtn.style.color = 'var(--dev-text-color)';
                            editarBtn.style.border = '1px solid var(--dev-border-color)';
                            editarBtn.dataset.patente = selectedInstance.patente;
                            editarBtn.dataset.lat = selectedInstance.lat;
                            editarBtn.dataset.lon = selectedInstance.lon;
                            editarBtn.textContent = 'Editar';
                            buttonsContainer.appendChild(editarBtn);
                        } else {
                            // Update existing button data
                            editarBtn.dataset.patente = selectedInstance.patente;
                            editarBtn.dataset.lat = selectedInstance.lat;
                            editarBtn.dataset.lon = selectedInstance.lon;
                            editarBtn.style.display = 'block';
                        }
                    }
                } else {
                    // Restore all locations data
                    verMapaBtn.dataset.locations = locationData;

                    // Change delete button back to delete all
                    eliminarBtn.id = 'eliminar-grupo';
                    eliminarBtn.removeAttribute('data-global-index');
                    eliminarBtn.textContent = 'Eliminar todos';

                    // Remove or hide edit button
                    if (editarBtn) {
                        editarBtn.style.display = 'none';
                    }
                }
            });
        }
    });

    // Use event delegation for all buttons
    listElement.removeEventListener('click', handleListClick);
    listElement.addEventListener('click', handleListClick);
}

function exportarPatentes() {
    const patentes = JSON.parse(localStorage.getItem('patentes')) || [];
    const patentesString = JSON.stringify(patentes);
    const patentesBase64 = btoa(encodeURIComponent(patentesString));

    // Show dialog with exportable string
    const dialog = document.getElementById('export-dialog');
    const textarea = document.getElementById('export-content');

    textarea.value = patentesBase64;
    dialog.showModal();

    // Select the text for easy copying
    textarea.select();
}

function mostrarImportarDialog() {
    const dialog = document.getElementById('import-dialog');
    dialog.showModal();
}

function importarPatentes() {
    const textarea = document.getElementById('import-content');
    const base64Content = textarea.value.trim();

    if (!base64Content) {
        showError('Por favor ingrese el código de importación');
        return;
    }

    try {
        const patentesString = decodeURIComponent(atob(base64Content));
        const newPatentes = JSON.parse(patentesString);

        if (!Array.isArray(newPatentes)) {
            throw new Error('Formato inválido');
        }

        // Check if user already has patentes saved locally
        const existingPatentes = JSON.parse(localStorage.getItem('patentes')) || [];
        if (existingPatentes.length > 0) {
            // Use our new confirmation dialog instead of confirm()
            showConfirmDialog(
                '¡Atención!',
                'Ya tienes patentes guardadas. Si continúas, todas las patentes existentes serán reemplazadas. ¿Estás seguro de que deseas continuar?',
                () => {
                    performImport(newPatentes);
                },
                () => {
                    // User canceled import
                    return;
                }
            );
            return;
        }

        performImport(newPatentes);

    } catch (error) {
        showError('El código de importación no es válido. Por favor verifique e intente nuevamente.');
        console.error(error);
    }
}

// Helper function to avoid code duplication in importarPatentes
function performImport(patentes) {
    localStorage.setItem('patentes', JSON.stringify(patentes));
    document.getElementById('import-dialog').close();
    actualizarLista();
    showInfoDialog("Éxito", "Patentes importadas con éxito");
}

document.getElementById('copy-export').addEventListener('click', () => {
    const textarea = document.getElementById('export-content');
    textarea.select();
    document.execCommand('copy');
    showInfoDialog("Copiado", "Código copiado al portapapeles");
});

function handleListClick(event) {
    const target = event.target;

    if (target.id === 'ver-detalle') {
        const patente = target.dataset.patente;
        document.getElementById('patente').value = patente;
        // Set a flag to indicate we're viewing an already captured plate
        window.viewingCapturedPlate = true;
        document.getElementById('form-patente').dispatchEvent(new Event('submit'));
    } else if (target.id === 'ver-mapa') {
        const patente = target.dataset.patente;
        const locations = JSON.parse(target.dataset.locations);
        showMap(locations, patente);
    } else if (target.id === 'eliminar-grupo') {
        const patente = target.dataset.patente;
        // Show confirmation dialog before deleting
        showConfirmDialog(
            '¿Eliminar patente?',
            `¿Estás seguro que deseas eliminar todas las capturas de la patente ${patente}?`,
            () => {
                const patentes = JSON.parse(localStorage.getItem('patentes')) || [];
                const newPatentes = patentes.filter((item) => item.patente !== patente);
                localStorage.setItem('patentes', JSON.stringify(newPatentes));
                actualizarLista();
            },
            () => {
                // User canceled the deletion - no action needed
            }
        );
    } else if (target.id === 'eliminar-individual') {
        const patente = target.dataset.patente;
        const globalIndex = parseInt(target.dataset.globalIndex);

        // Show confirmation dialog before deleting
        showConfirmDialog(
            '¿Eliminar captura?',
            `¿Estás seguro que deseas eliminar esta captura específica de la patente?`,
            () => {
                const patentes = JSON.parse(localStorage.getItem('patentes')) || [];
                // Remove the specific capture by its global index
                const newPatentes = patentes.filter((_, index) => index !== globalIndex);
                localStorage.setItem('patentes', JSON.stringify(newPatentes));
                actualizarLista();
            },
            () => {
                // User canceled the deletion - no action needed
            }
        );
    } else if (target.id === 'editar') {
        const patente = target.dataset.patente;
        const lat = parseFloat(target.dataset.lat);
        const lon = parseFloat(target.dataset.lon);
        mostrarEditarPatenteDialog(patente, lat, lon);
    }
}

// Enhanced showConfirmDialog with onCancel callback
function showConfirmDialog(title, message, onConfirm, onCancel = null) {
    const dialog = document.createElement('dialog');
    dialog.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto';

    dialog.innerHTML = `
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">${title}</h2>
        <p class="text-gray-700 dark:text-gray-300 mb-6">${message}</p>
        <div class="flex justify-end gap-2">
            <button id="confirm-action" class="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Confirmar</button>
            <button id="cancel-action" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">Cancelar</button>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    dialog.querySelector('#confirm-action').addEventListener('click', () => {
        onConfirm();
        dialog.close();
    });

    dialog.querySelector('#cancel-action').addEventListener('click', () => {
        if (onCancel) onCancel();
        dialog.close();
    });

    // Close on click outside
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            if (onCancel) onCancel();
            dialog.close();
        }
    });

    // Clean up on close
    dialog.addEventListener('close', () => {
        dialog.remove();
    });
}

function confirmarEliminarTodo() {
    showConfirmDialog(
        'Eliminar todas las patentes',
        '¿Estás seguro que deseas eliminar TODAS las patentes? Esta acción no se puede deshacer.',
        () => {
            localStorage.removeItem('patentes');
            actualizarLista();
            showInfoDialog('Operación completada', 'Todas las patentes han sido eliminadas');
        },
        () => {
            // User canceled the operation - no action needed
        }
    );
}

// New function for info dialogs to replace alerts
function showInfoDialog(title, message) {
    const dialog = document.createElement('dialog');
    dialog.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto';

    dialog.innerHTML = `
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">${title}</h2>
        <p class="text-gray-700 dark:text-gray-300 mb-6">${message}</p>
        <div class="flex justify-end">
            <button id="close-info" class="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500">Aceptar</button>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    dialog.querySelector('#close-info').addEventListener('click', () => {
        dialog.close();
    });

    // Close on click outside
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });

    // Clean up on close
    dialog.addEventListener('close', () => {
        dialog.remove();
    });
}

// Update showError to support dark mode and outside click closing
function showError(message) {
    const errorDialog = document.getElementById('error-dialog');
    const errorMessage = document.getElementById('error-message');

    if (errorDialog && errorMessage) {
        errorMessage.textContent = message;
        errorDialog.showModal();

        // Add close on outside click if not already added
        if (!errorDialog.dataset.outsideClickHandled) {
            errorDialog.addEventListener('click', (event) => {
                if (event.target === errorDialog) {
                    errorDialog.close();
                }
            });
            errorDialog.dataset.outsideClickHandled = 'true';
        }
    } else {
        // Create a dynamic error dialog if the static one isn't found
        const dialog = document.createElement('dialog');
        dialog.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto';

        dialog.innerHTML = `
            <h2 class="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">${message}</p>
            <div class="flex justify-end">
                <button id="close-error" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400">Cerrar</button>
            </div>
        `;

        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.querySelector('#close-error').addEventListener('click', () => {
            dialog.close();
            dialog.remove();
        });

        // Close on click outside
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });

        // Clean up on close
        dialog.addEventListener('close', () => {
            dialog.remove();
        });
    }
}

// Update showMap function for dark mode
function showMap(locations, patente) {
    const dialog = document.getElementById('map-dialog');
    const container = document.getElementById('map-container');
    const title = document.getElementById('map-title');

    // Update title with location count
    title.textContent = `${patente} - ${locations.length} ubicación(es)`;

    // Clear previous contents and create a new map container
    container.innerHTML = '';
    const mapDiv = document.createElement('div');
    mapDiv.id = 'leaflet-map';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    container.appendChild(mapDiv);

    // Initialize Leaflet map
    const map = L.map('leaflet-map');

    // Use standard OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Create a feature group to hold all markers
    const bounds = L.latLngBounds();

    // Add markers to the feature group
    locations.forEach((loc, index) => {
        const latlng = L.latLng(loc.lat, loc.lon);
        bounds.extend(latlng);
        // Format the date nicely for the popup
        const captureDate = loc.date ?
            new Date(loc.date).toLocaleString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }) : 'Fecha desconocida';

        L.marker([loc.lat, loc.lon])
            .addTo(map)
            .bindPopup(`#${index + 1} - Capturado: ${captureDate}`);
        // markerGroup.addLayer(marker);
    });

    // Calculate dynamic maxZoom based on the distance between points
    let dynamicMaxZoom = 18; // Default value
    let distance = -1;

    if (locations.length > 1) {
        // Calculate the diagonal distance of the bounds in meters
        distance = bounds.getSouthWest().distanceTo(bounds.getNorthEast());

        // Adjust zoom based on distance
        if (distance < 500) dynamicMaxZoom = 16;       // <500m: very close
        else if (distance < 1000) dynamicMaxZoom = 15; // <1km
        else if (distance < 3000) dynamicMaxZoom = 15; // <3km
        else if (distance < 10000) dynamicMaxZoom = 14; // <10km
        else if (distance < 50000) dynamicMaxZoom = 12; // <50km
        else if (distance < 200000) dynamicMaxZoom = 8; // <200km
        else if (distance < 1000000) dynamicMaxZoom = 5; // <1000km
        else if (distance < 5000000) dynamicMaxZoom = 4; // <5000km
        else if (distance < 10000000) dynamicMaxZoom = 2; // <10000km
        else dynamicMaxZoom = 1; // Very distant points
    } else {
        // For single location, use higher zoom
        dynamicMaxZoom = 16;
    }

    if (devMode) {
        console.info({
            distance,
            dynamicMaxZoom
        });
    }

    // Fit the map to the computed bounds with padding
    map.fitBounds(bounds, { padding: [100, 100], maxZoom: dynamicMaxZoom });

    // Ensure proper rendering after dialog opens
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    // Show dialog and clean up map on dialog close
    dialog.showModal();
    const closeHandler = () => {
        map.remove();
        dialog.removeEventListener('close', closeHandler);
    };
    dialog.addEventListener('close', closeHandler);
}

// Add this function to check for dev mode in URL
function checkDevModeInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('dev')) {
        devMode = true;
        document.body.classList.add('dev-mode');
    }
}

function toggleDevMode() {
    if (devMode) {
        // Turning off dev mode
        devMode = false;
        document.body.classList.remove('dev-mode');

        // Remove dev parameter from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('dev');
        window.history.replaceState({}, '', url);

        showInfoDialog("Modo desarrollador", "Modo desarrollador desactivado");
    } else {
        // This should not be directly accessible via button
        // but keeping it for completeness
        devMode = true;
        document.body.classList.add('dev-mode');

        // Add dev parameter to URL
        const url = new URL(window.location.href);
        url.searchParams.set('dev', '');
        window.history.replaceState({}, '', url);

        showInfoDialog("Modo desarrollador", "Modo desarrollador activado");
    }

    actualizarLista();
}

function mostrarCrearPatenteDialog() {
    const dialog = document.getElementById('patente-form-dialog');
    const form = document.getElementById('patente-form');
    const title = document.getElementById('patente-form-title');

    // Clear form fields
    document.getElementById('form-patente-id').value = '';
    document.getElementById('form-lat').value = '';
    document.getElementById('form-lon').value = '';

    // Set form title and action
    title.textContent = 'Crear Nueva Patente';
    form.dataset.action = 'crear';

    dialog.showModal();
}

function mostrarEditarPatenteDialog(patente, lat, lon) {
    const dialog = document.getElementById('patente-form-dialog');
    const form = document.getElementById('patente-form');
    const title = document.getElementById('patente-form-title');

    // Fill form fields with existing data
    document.getElementById('form-patente-id').value = patente;
    document.getElementById('form-lat').value = lat;
    document.getElementById('form-lon').value = lon;

    // Set form title and action
    title.textContent = 'Editar Patente';
    form.dataset.action = 'editar';
    form.dataset.originalPatente = patente;

    dialog.showModal();
}

function guardarPatente(event) {
    event.preventDefault();

    const form = document.getElementById('patente-form');
    const patenteValue = document.getElementById('form-patente-id').value.trim();
    const lat = parseFloat(document.getElementById('form-lat').value);
    const lon = parseFloat(document.getElementById('form-lon').value);

    if (!patenteValue || isNaN(lat) || isNaN(lon)) {
        showError('Todos los campos son obligatorios');
        return;
    }

    const patentes = JSON.parse(localStorage.getItem('patentes')) || [];

    if (form.dataset.action === 'crear') {
        // Add new patente
        patentes.push({
            patente: patenteValue,
            lat,
            lon,
            date: new Date().toISOString()
        });
    } else if (form.dataset.action === 'editar') {
        const originalPatente = form.dataset.originalPatente;

        // Update existing patente
        const index = patentes.findIndex(item => item.patente === originalPatente);
        if (index !== -1) {
            const oldPatente = patentes[index];
            patentes[index] = {
                patente: patenteValue,
                lat,
                lon,
                date: oldPatente.date // Keep original date
            };
        }
    }

    localStorage.setItem('patentes', JSON.stringify(patentes));
    document.getElementById('patente-form-dialog').close();
    actualizarLista();
}