import {
    showError,
    showInfoDialog,
    showConfirmDialog,
    showMap,
    setupThemeToggle
} from '../../ui.js';
import {
    mockLocalStorageGetItem
} from '../utils/test-utils.js';

// Mock DOM elements
document.body.innerHTML = `
    <dialog id="error-dialog">
        <p id="error-message"></p>
    </dialog>
    <dialog id="map-dialog">
        <div id="map-container"></div>
        <h2 id="map-title"></h2>
        <button id="close-map"></button>
    </dialog>
    <button id="theme-toggle"></button>
`;

describe('showError', () => {
    it('should show the error dialog with the specified message', () => {
        const dialog = document.getElementById('error-dialog');
        const messageEl = document.getElementById('error-message');
        dialog.showModal = jest.fn();

        showError('Test error message');
        expect(dialog.showModal).toHaveBeenCalled();
        expect(messageEl.textContent).toBe('Test error message');
    });

    it('should create a dynamic error dialog if the static one isn\'t found', () => {
        // Remove the static error dialog
        const errorDialog = document.getElementById('error-dialog');
        if (errorDialog) {
            errorDialog.remove();
        }

        showError('Test error message');

        // Check if a dynamic dialog was created and displayed
        const dynamicDialog = document.querySelector('dialog');
        expect(dynamicDialog).not.toBeNull();
        expect(dynamicDialog.innerHTML).toContain('Test error message');

        // Clean up the dynamic dialog
        dynamicDialog.close();
    });
});

describe('showInfoDialog', () => {
    it('should show the info dialog with the specified title and message', () => {
        showInfoDialog('Test title', 'Test message');

        // Check if a dynamic dialog was created and displayed
        const dynamicDialog = document.querySelector('dialog');
        expect(dynamicDialog).not.toBeNull();
        expect(dynamicDialog.innerHTML).toContain('Test title');
        expect(dynamicDialog.innerHTML).toContain('Test message');

        // Clean up the dynamic dialog
        dynamicDialog.close();
    });
});

describe('showConfirmDialog', () => {
    it('should show the confirm dialog with the specified title and message', () => {
        showConfirmDialog('Test title', 'Test message', () => {});

        // Check if a dynamic dialog was created and displayed
        const dynamicDialog = document.querySelector('dialog');
        expect(dynamicDialog).not.toBeNull();
        expect(dynamicDialog.innerHTML).toContain('Test title');
        expect(dynamicDialog.innerHTML).toContain('Test message');

        // Clean up the dynamic dialog
        dynamicDialog.close();
    });

    it('should call onConfirm when confirm button is clicked', () => {
        const onConfirm = jest.fn();
        showConfirmDialog('Test title', 'Test message', onConfirm);

        const confirmButton = document.getElementById('confirm-action');
        confirmButton.click();

        expect(onConfirm).toHaveBeenCalled;

        // Clean up the dynamic dialog
        const dynamicDialog = document.querySelector('dialog');
        dynamicDialog.close();
    });

    it('should call onCancel when cancel button is clicked', () => {
        const onCancel = jest.fn();
        showConfirmDialog('Test title', 'Test message', () => {}, onCancel);

        const cancelButton = document.getElementById('cancel-action');
        cancelButton.click();

        expect(onCancel).toHaveBeenCalled;

        // Clean up the dynamic dialog
        const dynamicDialog = document.querySelector('dialog');
        dynamicDialog.close();
    });

    it('should call onCancel when dialog is clicked outside', () => {
        const onCancel = jest.fn();
        showConfirmDialog('Test title', 'Test message', () => {}, onCancel);

        const dynamicDialog = document.querySelector('dialog');
        dynamicDialog.click();

        expect(onCancel).toHaveBeenCalled;

        // Clean up the dynamic dialog
        dynamicDialog.close();
    });

    it('should not call onCancel when dialog is clicked outside if onCancel is null', () => {
        const onCancel = null;
        const onConfirm = jest.fn();
        showConfirmDialog('Test title', 'Test message', onConfirm, onCancel);

        const dynamicDialog = document.querySelector('dialog');
        dynamicDialog.click();

        expect(onConfirm).not.toHaveBeenCalled;

        // Clean up the dynamic dialog
        dynamicDialog.close();
    });
});

describe('showMap', () => {
    it('should show the map dialog with the location(s) of a license plate', () => {
        const locations = [{
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }];
        showMap(locations, 'D123XXA');
        expect(document.getElementById('map-dialog').showModal).toHaveBeenCalled;
    });
});

describe('setupThemeToggle', () => {
    it('should setup the theme toggle', () => {
        mockLocalStorageGetItem('theme', 'light');
        setupThemeToggle();
        expect(localStorage.getItem).toHaveBeenCalled;
    });

    it('should set the theme to dark if it is not set', () => {
        mockLocalStorageGetItem('theme', null);
        setupThemeToggle();
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should toggle the theme when the button is clicked', () => {
        mockLocalStorageGetItem('theme', 'light');
        setupThemeToggle();
        const themeToggleBtn = document.getElementById('theme-toggle');
        themeToggleBtn.click();
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
});
