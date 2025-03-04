import {
    toggleDevMode,
    checkDevModeInUrl,
    mostrarCrearPatenteDialog,
    guardarPatente
} from '../../patentes.js';
import {
    showError,
    showInfoDialog
} from '../../ui.js';
import {
    mockLocalStorageGetItem,
    mockLocalStorageSetItem
} from '../utils/test-utils.js';

// Mock the UI functions
jest.mock('../../ui.js', () => ({
    showError: jest.fn(),
    showInfoDialog: jest.fn(),
    showConfirmDialog: jest.fn(),
    showMap: jest.fn(),
    setupThemeToggle: jest.fn()
}));

// Mock DOM elements
document.body.innerHTML = `
    <dialog id="patente-form-dialog">
        <h2 id="patente-form-title"></h2>
        <form id="patente-form">
            <input type="text" id="form-patente-id">
            <input type="number" id="form-lat">
            <input type="number" id="form-lon">
            <button id="cancel-patente-form"></button>
        </form>
    </dialog>
    <h1 id="page-title"></h1>
    <button id="dev-mode-toggle"></button>
`;

global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

describe('toggleDevMode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.devMode = false;
        document.body.classList.remove('dev-mode');
        // Mock the window.location and window.history objects
        const mockURL = 'http://localhost/';
        global.window = Object.create(window);
        Object.defineProperty(window, 'location', {
            value: {
                href: mockURL,
                search: ''
            },
            writable: true
        });
        Object.defineProperty(window, 'history', {
            value: {
                replaceState: jest.fn()
            }
        });
    });

    it('should enable dev mode', () => {
        toggleDevMode();
        expect(global.devMode).toBe(true);
        expect(document.body.classList.contains('dev-mode')).toBe(true);
        expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", "Modo desarrollador activado");
    });

    it('should disable dev mode', () => {
        global.devMode = true;
        document.body.classList.add('dev-mode');
        toggleDevMode();
        expect(global.devMode).toBe(false);
        expect(document.body.classList.contains('dev-mode')).toBe(false);
        expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", "Modo desarrollador desactivado");
    });
});

describe('mostrarCrearPatenteDialog', () => {
    it('should show the create patente dialog', () => {
        mostrarCrearPatenteDialog();
        expect(document.getElementById('patente-form-dialog').showModal).toHaveBeenCalled;
        expect(document.getElementById('patente-form-title').textContent).toBe('Crear Nueva Patente');
    });
});

describe('checkDevModeInUrl', () => {
    it('should enable dev mode if dev parameter exists in URL', () => {
        // Mock the window.location and window.history objects
        const mockURL = 'http://localhost/?dev';
        global.window = Object.create(window);
        Object.defineProperty(window, 'location', {
            value: {
                href: mockURL,
                search: '?dev'
            },
            writable: true
        });
        Object.defineProperty(window, 'history', {
            value: {
                replaceState: jest.fn()
            }
        });
        checkDevModeInUrl();
        expect(global.devMode).toBe(true);
        expect(document.body.classList.contains('dev-mode')).toBe(true);
    });
});

describe('guardarPatente', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorageGetItem('patentes', null);
        mockLocalStorageSetItem('patentes');
        document.getElementById('form-patente-id').value = 'D123XXA';
        document.getElementById('form-lat').value = 10;
        document.getElementById('form-lon').value = 20;
    });

    it('should show error if any field is empty', () => {
        document.getElementById('form-patente-id').value = '';
        const event = {
            preventDefault: jest.fn()
        };
        guardarPatente(event);
        expect(showError).toHaveBeenCalledWith('Todos los campos son obligatorios');
    });

    it('should add a new patente to localStorage when action is "crear"', () => {
        document.getElementById('patente-form').dataset.action = 'crear';
        const event = {
            preventDefault: jest.fn()
        };
        guardarPatente(event);
        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should update an existing patente in localStorage when action is "editar"', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'D123XXA',
            lat: 0,
            lon: 0,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        document.getElementById('patente-form').dataset.action = 'editar';
        document.getElementById('patente-form').dataset.originalPatente = 'D123XXA';
        const event = {
            preventDefault: jest.fn()
        };
        guardarPatente(event);
        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should close the patente form dialog after saving', () => {
        document.getElementById('patente-form').dataset.action = 'crear';
        const event = {
            preventDefault: jest.fn()
        };
        guardarPatente(event);
        expect(document.getElementById('patente-form-dialog').close).toHaveBeenCalled;
    });
});
