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

    const alreadyInList = patentes.some((item) => item.patente === patente);
    if (alreadyInList) {
        return showError("Patente ya capturada en el pasado");
    }

    patentes.push({
        patente,
        lat,
        lon,
        date: new Date().toISOString()
    });
    localStorage.setItem('patentes', JSON.stringify(patentes));
    alert("Patente capturada con éxito");

    actualizarLista();
}

function actualizarLista() {
    const patentes = JSON.parse(localStorage.getItem('patentes')) || [];
    const list = document.getElementById('patentes-capturadas');
    
    // Header with export/import buttons and dev buttons
    let buttonsHtml = `<button id='importar-btn'>Importar</button>`;
    
    if (patentes.length > 0) {
        buttonsHtml = `<button id='exportar-btn'>Exportar</button> ${buttonsHtml}`;
    }
    
    if (devMode) {
        buttonsHtml += ` <button id='crear-btn' class="dev-button">Crear</button>`;
        if (patentes.length > 0) {
            buttonsHtml += ` <button id='eliminar-todo-btn' class="dev-button">Eliminar todo</button>`;
        }
    }
    
    if (patentes.length === 0) {
        list.innerHTML = `<br><hr><h2>Patentes capturadas ${buttonsHtml}</h2><h3>Lista vacía</h3>`;
    } else {
        list.innerHTML = `<br><hr><h2>Patentes capturadas ${buttonsHtml}</h2>`;
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
    
    patentes.forEach((item) => {
        // Format the date in Argentine Spanish format
        const formattedDate = new Date(item.date).toLocaleString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        const li = document.createElement('li');
        li.classList.add('patente-item');
        
        let buttonsHtml = `
            <button id="ver-detalle" data-patente="${item.patente}">Ver detalle</button>
            <button id="ver-mapa" data-lat="${item.lat}" data-lon="${item.lon}" data-patente="${item.patente}">Ver en mapa</button>
            <button id="eliminar" data-patente="${item.patente}">Eliminar</button>
        `;
        
        // Add edit button if in dev mode
        if (devMode) {
            buttonsHtml += `<button id="editar" data-patente="${item.patente}" data-lat="${item.lat}" data-lon="${item.lon}" class="dev-button">Editar</button>`;
        }
        
        li.innerHTML = `${item.patente} - ${formattedDate} - ${buttonsHtml}`;
        list.appendChild(li);
    });
    list.addEventListener('click', handleListClick);
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
            // Ask for confirmation before overwriting
            if (!confirm('¡ATENCIÓN! Ya tienes patentes guardadas. Si continúas, todas las patentes existentes serán reemplazadas. ¿Estás seguro de que deseas continuar?')) {
                return; // User cancelled the import
            }
        }
        
        localStorage.setItem('patentes', JSON.stringify(newPatentes));
        document.getElementById('import-dialog').close();
        actualizarLista();
        alert('Patentes importadas con éxito');
    } catch (error) {
        showError('El código de importación no es válido. Por favor verifique e intente nuevamente.');
        console.error(error);
    }
}

function handleListClick(event) {
    if (event.target.id === 'ver-detalle') {
        const patente = event.target.dataset.patente;
        document.getElementById('patente').value = patente;
        // Set a flag to indicate we're viewing an already captured plate
        window.viewingCapturedPlate = true;
        document.getElementById('form-patente').dispatchEvent(new Event('submit'));
    } else if (event.target.id === 'ver-mapa') {
        const lat = parseFloat(event.target.dataset.lat);
        const lon = parseFloat(event.target.dataset.lon);
        const patente = event.target.dataset.patente;
        showMap(lat, lon, patente);
    } else if (event.target.id === 'eliminar') {
        const patente = event.target.dataset.patente;
        const patentes = JSON.parse(localStorage.getItem('patentes')) || [];
        const newPatentes = patentes.filter((item) => item.patente !== patente);
        localStorage.setItem('patentes', JSON.stringify(newPatentes));
        actualizarLista();
    } else if (event.target.id === 'editar') {
        const patente = event.target.dataset.patente;
        const lat = parseFloat(event.target.dataset.lat);
        const lon = parseFloat(event.target.dataset.lon);
        mostrarEditarPatenteDialog(patente, lat, lon);
    }
}

function showMap(lat, lon, patente) {
    const dialog = document.getElementById('map-dialog');
    const container = document.getElementById('map-container');
    const title = document.getElementById('map-title');
    title.innerHTML = patente;
    
    // Limpiar mapa anterior si existe
    container.innerHTML = '';
    
    // Crear iframe de mapa usando OpenStreetMap
    container.innerHTML = `<iframe width="100%" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" 
        src="https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}" 
        style="border: 1px solid black"></iframe>
        <br/>
        <small class="map-link"><a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15" target="_blank">Ver en OpenStreetMap</a></small>`;
    
    // Mostrar el diálogo
    dialog.showModal();
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
        
        alert('Modo desarrollador desactivado');
    } else {
        // This should not be directly accessible via button
        // but keeping it for completeness
        devMode = true;
        document.body.classList.add('dev-mode');
        
        // Add dev parameter to URL
        const url = new URL(window.location.href);
        url.searchParams.set('dev', '');
        window.history.replaceState({}, '', url);
        
        alert('Modo desarrollador activado');
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
        // Check if patente already exists
        if (patentes.some(item => item.patente === patenteValue)) {
            showError('Esta patente ya existe');
            return;
        }
        
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

// Function to handle the "Eliminar todo" button click
function confirmarEliminarTodo() {
    if (confirm('¿Estás seguro que deseas eliminar TODAS las patentes? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('patentes');
        actualizarLista();
        alert('Todas las patentes han sido eliminadas');
    }
}

// Make showError available globally
function showError(message) {
    const errorDialog = document.getElementById('error-dialog');
    const errorMessage = document.getElementById('error-message');
    
    if (errorDialog && errorMessage) {
        errorMessage.textContent = message;
        errorDialog.showModal();
    } else {
        // Fallback to alert if dialog elements aren't found
        alert(message);
    }
}