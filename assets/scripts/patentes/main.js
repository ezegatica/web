import {
    showError,
} from './ui.js';
import {
    initApp,
    sanitizeInput,
    handleCapturar,
    clearSearchParams,
    clearResults
} from './patentes.js';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main application
    initApp();

    // Make certain functions available globally for event handlers in HTML
    window.sanitizeInput = sanitizeInput;
    window.handleCapturar = handleCapturar;
    window.showError = showError;
    window.clearSearchParams = clearSearchParams;
    window.clearResults = clearResults;

    // Let the rest of the app know the DOM is ready
    document.dispatchEvent(new CustomEvent('app:ready'));
});
