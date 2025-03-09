/**
 * UI utility functions for the patentes application
 */

/**
 * Shows an error dialog with the specified message
 * @param {string} message - Error message to display
 */
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

/**
 * Shows an information dialog with the specified title and message
 * @param {string} title - Title of the dialog
 * @param {string} message - Message to display
 */
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

/**
 * Shows a confirmation dialog with the specified title and message
 * @param {string} title - Title of the dialog
 * @param {string} message - Message to display
 * @param {Function} onConfirm - Callback function to execute on confirmation
 * @param {Function} [onCancel=null] - Callback function to execute on cancellation
 */
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

/**
 * Shows a map dialog with the location(s) of a license plate
 * @param {Array} locations - Array of location objects with lat, lon and date properties 
 * @param {string} patente - License plate number
 */
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

/**
 * Updates the UI to reflect the current theme
 */
function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // If no theme is saved, default to light
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }

    // Toggle theme when button is clicked
    themeToggleBtn.addEventListener('click', function () {
        const isDarkMode = document.documentElement.classList.contains('dark');
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

export { setupThemeToggle, showError, showInfoDialog, showConfirmDialog, showMap };
