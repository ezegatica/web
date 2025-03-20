import { countries } from './data/countries.js';
import { categories } from './data/categories.js';
import { showError, showInfoDialog, showConfirmDialog, showMap, setupThemeToggle } from './ui.js';
import { initShare } from './share.js';

// State variables
let devMode = false;
let devModeClicks = 0;

/**
 * Initialize the application when DOM is ready
 */
export function initApp() {
    // Setup event listeners
    setupFormHandlers();
    setupDialogHandlers();
    setupDevModeHandlers();
    setupThemeToggle();

    // Check for dev mode in URL
    checkDevModeInUrl();

    // Process URL parameters (e.g., pre-filled patente)
    processUrlParams();

    // Update the list of captured plates
    actualizarLista();

    // Add outside click handling to all static dialogs
    setupDialogOutsideClickHandlers();

    // Initialize share with both functions
    initShare({
        showErrorFn: showError,
        showInfoDialogFn: showInfoDialog
    });
}

/**
 * Setup handlers for form submission and reset
 */
function setupFormHandlers() {
    const form = document.getElementById('form-patente');
    const patenteInput = document.getElementById('patente');
    const capturarButton = document.getElementById('capturar');

    // Form submission handler
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!patenteInput.value) {
            showError('Debe ingresar una patente');
            return;
        }

        const result = sanitizeInput(patenteInput.value);

        if (result.error) {
            showError(result.error);
            return;
        }

        updateDetailsDialog(result);

        // Show the dialog
        document.getElementById('patente-detail-dialog').showModal();
    });

    // Form reset handler
    form.addEventListener('reset', (event) => {
        clearResults();
        clearSearchParams();
    });

    // Capture button handler
    capturarButton.addEventListener('click', handleCapturar);
}

/**
 * Setup handlers for all dialogs
 */
function setupDialogHandlers() {
    // Map dialog close button
    document.getElementById('close-map').addEventListener('click', () => {
        document.getElementById('map-dialog').close();
    });

    // Export dialog
    document.getElementById('close-export').addEventListener('click', () => {
        document.getElementById('export-dialog').close();
    });

    document.getElementById('copy-export').addEventListener('click', copyExportHandler);

    // Import dialog
    document.getElementById('close-import').addEventListener('click', () => {
        document.getElementById('import-dialog').close();
    });

    document.getElementById('confirm-import').addEventListener('click', importarPatentes);

    // Error dialog
    document.getElementById('close-error').addEventListener('click', () => {
        document.getElementById('error-dialog').close();
    });

    // Patente detail dialog
    document.getElementById('close-detail').addEventListener('click', () => {
        document.getElementById('patente-detail-dialog').close();
        clearSearchParams(); // Remove patente from URL
    });

    // Patente form dialog
    document.getElementById('patente-form').addEventListener('submit', guardarPatente);
    document.getElementById('cancel-patente-form').addEventListener('click', () => {
        document.getElementById('patente-form-dialog').close();
    });
}

/**
 * Setup handlers for dev mode toggling
 */
function setupDevModeHandlers() {
    // Secret dev mode toggle (5 clicks on title)
    document.getElementById('page-title').addEventListener('click', () => {
        devModeClicks++;
        if (devModeClicks >= 5) {
            toggleDevMode();
            devModeClicks = 0;
        }
    });

    // Visible dev mode toggle (only shown when in dev mode)
    document.getElementById('dev-mode-toggle').addEventListener('click', toggleDevMode);
}

/**
 * Add outside click handling to all static dialogs
 */
function setupDialogOutsideClickHandlers() {
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                dialog.close();
                clearSearchParams();
            }
        });
    });
}

/**
 * Check URL for patente parameter and fill input
 */
function processUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const patente = urlParams.get('patente');
    if (patente) {
        document.getElementById('patente').value = patente;
        document.getElementById('form-patente').dispatchEvent(new Event('submit'));
    }
}

/**
 * Clear any visual elements that need to be reset
 */
export function clearResults() {
    const errorElement = document.getElementById('error');
    if (errorElement) errorElement.innerHTML = "";
}

/**
 * Clean and analyze user input to identify the type of license plate or code
 * @param {string} input - User input to sanitize and analyze
 * @returns {Object} Result object with parsed data
 */
export function sanitizeInput(input) {
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
        result.pais = countries[patenteClean];

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
        result.categoria = categories[categoriaChar];

        if (!result.categoria) {
            result.error = "Categoría no encontrada";
            return result;
        }

        // Verify country code
        result.codigo = paisStr;
        result.pais = countries[paisStr];

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

/**
 * Update the details dialog with the parsed license plate information
 * @param {Object} result - The parsed license plate data
 */
export function updateDetailsDialog(result) {
    // Update text information
    const traduccionEl = document.getElementById('traduccion-dialog');
    if (traduccionEl) traduccionEl.innerHTML = result.pais;
    const codigoEl = document.getElementById('codigo-dialog');
    if (codigoEl) codigoEl.innerHTML = `${result.codigo}: `;

    if (result.categoria) {
        document.getElementById('categoria-traduccion-dialog').innerHTML = `${result.categoriaTraduccion}: `;
        document.getElementById('categoria-dialog').innerHTML = result.categoria;
        document.getElementById('categoria-container').style.display = 'block';
    } else {
        document.getElementById('categoria-traduccion-dialog').innerHTML = '';
        document.getElementById('categoria-dialog').innerHTML = '';
        document.getElementById('categoria-container').style.display = 'none';
    }

    if (result.usoJefe) {
        document.getElementById('uso-jefe-dialog').innerHTML = '<b>A</b>: Uso exclusivo de jefes de misiones diplomaticas';
    } else {
        document.getElementById('uso-jefe-dialog').innerHTML = '';
    }

    // Generate visual decomposition
    updateVisualDecomposition(result);

    // Only show capture button for complete plates
    if (result.esPatenteCompleta) {
        // Only check for already captured plates if it's a complete plate
        if (window.viewingCapturedPlate) {
            document.getElementById('capturar').style.display = 'none';
            // Reset the flag
            window.viewingCapturedPlate = false;
        } else {
            document.getElementById('capturar').style.display = 'inline';
        }
    } else {
        // Never show capture button for incomplete plates
        document.getElementById('capturar').style.display = 'none';
    }
}

/**
 * Generate and update the visual decomposition of the license plate
 * @param {Object} result - The parsed license plate data
 */
function updateVisualDecomposition(result) {
    const inputValue = result.input;
    const visualContainer = document.getElementById('patente-visual');

    // Clear previous content
    visualContainer.innerHTML = '';

    if (result.esPatenteCompleta) {
        // Complete plate visualization (format: D000XXA)
        const categoriaChar = inputValue.charAt(0);
        const numeroStr = inputValue.substring(1, 4);
        const paisStr = inputValue.substring(4, 6);
        const usoChar = inputValue.charAt(6);

        // Create span elements for each part
        const categoriaSpan = document.createElement('span');
        categoriaSpan.className = 'patente-part part-categoria flex items-center justify-center';
        categoriaSpan.textContent = categoriaChar;
        categoriaSpan.title = result.categoria || 'Categoría';

        const numeroSpan = document.createElement('span');
        numeroSpan.className = 'patente-part part-numero flex items-center justify-center';
        numeroSpan.textContent = numeroStr;
        numeroSpan.title = 'Número asignado';

        const paisSpan = document.createElement('span');
        paisSpan.className = 'patente-part part-pais flex items-center justify-center';
        paisSpan.textContent = paisStr;
        paisSpan.title = result.pais;

        const usoSpan = document.createElement('span');
        usoSpan.className = 'patente-part part-uso flex items-center justify-center';
        usoSpan.textContent = usoChar;
        usoSpan.title = result.usoJefe ? 'Uso exclusivo de jefes de misiones diplomaticas' : 'Uso general';

        // Add all parts to the container
        visualContainer.appendChild(categoriaSpan);
        visualContainer.appendChild(numeroSpan);
        visualContainer.appendChild(paisSpan);
        visualContainer.appendChild(usoSpan);

        document.getElementById('decomposition-container').style.display = 'block';
    } else if (inputValue.length === 2) {
        // Just country code visualization
        const paisSpan = document.createElement('span');
        paisSpan.className = 'patente-part part-pais flex items-center justify-center';
        paisSpan.textContent = result.codigo;
        paisSpan.title = result.pais;

        // Add country code to container
        visualContainer.appendChild(paisSpan);

        document.getElementById('decomposition-container').style.display = 'block';
    } else {
        // Hide the decomposition if not a recognizable pattern
        document.getElementById('decomposition-container').style.display = 'none';
    }
}

/**
 * Remove patente parameter from URL
 */
export function clearSearchParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete('patente');
    window.history.replaceState({}, '', url);
}

/**
 * Handle the capture button click to get user's location
 */
export function handleCapturar() {
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

/**
 * Add a captured license plate to localStorage
 * @param {string} patente - License plate number
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
function addPatente(patente, lat, lon) {
    const patentes = JSON.parse(localStorage.getItem('patentes')) || [];

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

/**
 * Update the UI list of captured plates
 */
export function actualizarLista() {
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
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Patentes capturadas</h2>
                    <div class="flex flex-wrap gap-2">${buttonsHtml}</div>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-center py-8">No hay patentes capturadas</p>
            </div>
        `;
    } else {
        list.innerHTML = `
            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Patentes capturadas (${patentes.length})</h2>
                    <div class="flex flex-wrap gap-2">${buttonsHtml}</div>
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

/**
 * Export captured plates to a Base64 string
 */
export function exportarPatentes() {
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

/**
 * Show the import dialog
 */
export function mostrarImportarDialog() {
    const dialog = document.getElementById('import-dialog');
    dialog.showModal();
}

/**
 * Import patentes from a Base64 string
 */
export function importarPatentes() {
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

/**
 * Helper function to avoid code duplication in importarPatentes
 * @param {Array} patentes - Array of license plate objects to import
 */
export function performImport(patentes) {
    localStorage.setItem('patentes', JSON.stringify(patentes));
    document.getElementById('import-dialog').close();
    actualizarLista();
    showInfoDialog("Éxito", "Patentes importadas con éxito");
}

/**
 * Handle clicks on captured plates list using event delegation
 * @param {Event} event - Click event
 */
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


/**
 * Show a confirmation dialog to delete all captured plates
 */
export function confirmarEliminarTodo() {
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

/**
 * Check for dev mode in URL and enable it if present
 */
function checkDevModeInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('dev')) {
        devMode = true;
        document.body.classList.add('dev-mode');
    }
    window.devMode = devMode;
}

/**
 * Toggle dev mode on and off
 */
export function toggleDevMode() {
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

    window.devMode = devMode;

    actualizarLista();
}

/**
 * Show the dialog to create a new license plate
 */
export function mostrarCrearPatenteDialog() {
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

/**
 * Show the dialog to edit an existing license plate
 * @param {string} patente - License plate number
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
export function mostrarEditarPatenteDialog(patente, lat, lon) {
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

/**
 * Save the license plate from the form
 * @param {Event} event - Form submit event
 */
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

// Export these functions for testing
export {
    setupFormHandlers,
    setupDialogHandlers,
    setupDevModeHandlers,
    setupDialogOutsideClickHandlers,
    checkDevModeInUrl,
    addPatente,
    copyExportHandler,
    devMode
};

/**
 * Handler for copy-export button
 */
function copyExportHandler() {
    const textarea = document.getElementById('export-content');
    textarea.select();
    document.execCommand('copy');
    showInfoDialog("Copiado", "Código copiado al portapapeles");
}