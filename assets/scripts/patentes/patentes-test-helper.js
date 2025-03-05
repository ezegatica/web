
/**
 * Helper module to expose internal functions from patentes.js for testing purposes
 */

import * as patentesModule from './patentes.js';

// Export already exported functions
export const { 
    initApp, 
    clearResults, 
    sanitizeInput, 
    updateDetailsDialog, 
    handleCapturar, 
    clearSearchParams 
} = patentesModule;

// Add the following functions to expose internal functions
// These functions will call the internal functions from patentes.js

/**
 * Process URL parameters for testing
 */
export function testProcessUrlParams() {
    // Get the function from module closure - this can access patentes.js internal functions
    const processUrlParams = patentesModule.processUrlParams;
    if (typeof processUrlParams === 'function') {
        return processUrlParams();
    }
}

/**
 * Toggle dev mode for testing
 */
export function testToggleDevMode() {
    // Get the function from module closure
    const toggleDevMode = patentesModule.toggleDevMode;
    if (typeof toggleDevMode === 'function') {
        return toggleDevMode();
    }
}

/**
 * Handle list click for testing
 * @param {Event} event - The click event
 */
export function testHandleListClick(event) {
    // Get the function from module closure
    const handleListClick = patentesModule.handleListClick;
    if (typeof handleListClick === 'function') {
        return handleListClick(event);
    }
}

/**
 * Guardar patente function for testing
 * @param {Event} event - The form submit event
 */
export function testGuardarPatente(event) {
    // Get the function from module closure
    const guardarPatente = patentesModule.guardarPatente;
    if (typeof guardarPatente === 'function') {
        return guardarPatente(event);
    }
}
