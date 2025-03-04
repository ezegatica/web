import {
    sanitizeInput,
    updateDetailsDialog,
    clearSearchParams,
    handleCapturar,
    clearResults,
    addPatente,
    actualizarLista,
    exportarPatentes,
    importarPatentes,
    initApp,
    setupFormHandlers,
    setupDialogHandlers,
    setupDialogOutsideClickHandlers,
    processUrlParams,
    updateVisualDecomposition,
    mostrarImportarDialog,
    confirmarEliminarTodo,
    handleListClick
} from '../../patentes.js';
import {
    mockLocalStorageGetItem,
    mockLocalStorageSetItem,
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
    <div id="error"></div>
    <input type="text" id="patente">
    <dialog id="patente-detail-dialog">
        <span id="traduccion-dialog"></span>
        <span id="codigo-dialog"></span>
        <div id="categoria-container">
            <span id="categoria-traduccion-dialog"></span>
            <span id="categoria-dialog"></span>
        </div>
        <span id="uso-jefe-dialog"></span>
        <div id="decomposition-container">
            <div id="patente-visual"></div>
        </div>
        <button id="capturar"></button>
        <button id="close-detail"></button>
    </dialog>
    <div id="patentes-capturadas"></div>
    <dialog id="export-dialog">
        <textarea id="export-content"></textarea>
        <button id="close-export"></button>
    </dialog>
    <dialog id="import-dialog">
        <textarea id="import-content"></textarea>
        <button id="close-import"></button>
        <button id="confirm-import"></button>
    </dialog>
`;

global.URL.createObjectURL = jest.fn(() => 'blob:test');
global.document.execCommand = jest.fn();
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

describe('sanitizeInput', () => {
    it('should return an error for invalid input format', () => {
        const result = sanitizeInput('INVALID');
        expect(result.error).toBe("Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra");
    });

    it('should return country code and name for valid 2-letter country code', () => {
        const result = sanitizeInput('AR');
        expect(result.codigo).toBe('AR');
        expect(result.pais).toBe('REPÚBLICA POPULAR CHINA');
        expect(result.error).toBeNull();
    });

    it('should return an error for non-existent country code', () => {
        const result = sanitizeInput('XX');
        expect(result.codigo).toBe('XX');
        expect(result.pais).toBeUndefined();
        expect(result.error).toBe('Código de país no encontrado');
    });

    it('should return parsed data for valid complete diplomatic plate', () => {
        const result = sanitizeInput('D123XXA');
        expect(result.esPatenteCompleta).toBe(true);
        expect(result.categoriaTraduccion).toBe('D');
        expect(result.categoria).toBe('CUERPO DIPLOMATICO');
        expect(result.codigo).toBe('XX');
        expect(result.pais).toBeUndefined();
        expect(result.usoJefe).toBe(true);
        expect(result.error).toBe('Código de país no encontrado');
    });

    it('should handle lowercase input and trim whitespace', () => {
        const result = sanitizeInput('  d123xxa  ');
        expect(result.esPatenteCompleta).toBe(true);
        expect(result.categoriaTraduccion).toBe('D');
        expect(result.categoria).toBe('CUERPO DIPLOMATICO');
        expect(result.codigo).toBe('XX');
        expect(result.pais).toBeUndefined();
        expect(result.usoJefe).toBe(true);
        expect(result.error).toBe('Código de país no encontrado');
        expect(result.input).toBe('D123XXA');
    });

    it('should return an error for non-existent category', () => {
        const result = sanitizeInput('Z123XXA');
        expect(result.categoria).toBeUndefined();
        expect(result.error).toBe('Categoría no encontrada');
    });

    it('should handle diplomatic plate without chief of mission use', () => {
        const result = sanitizeInput('D123XXB');
        expect(result.usoJefe).toBe(false);
    });
});

describe('updateDetailsDialog', () => {
    it('should update the details dialog with the parsed license plate information', () => {
        const result = {
            input: 'D123XXA',
            codigo: 'XX',
            pais: 'Test Country',
            categoria: 'Test Category',
            categoriaTraduccion: 'T',
            usoJefe: true,
            esPatenteCompleta: true,
            error: null
        };

        updateDetailsDialog(result);

        expect(document.getElementById('traduccion-dialog').innerHTML).toBe('Test Country');
        expect(document.getElementById('codigo-dialog').innerHTML).toBe('XX: ');
        expect(document.getElementById('categoria-traduccion-dialog').innerHTML).toBe('T: ');
        expect(document.getElementById('categoria-dialog').innerHTML).toBe('Test Category');
        expect(document.getElementById('uso-jefe-dialog').innerHTML).toBe('<b>A</b>: Uso exclusivo de jefes de misiones diplomaticas');
        expect(document.getElementById('decomposition-container').style.display).toBe('block');
        expect(document.getElementById('capturar').style.display).toBe('inline');
    });

    it('should hide category information if category is not present in result', () => {
        const result = {
            input: 'XX',
            codigo: 'XX',
            pais: 'Test Country',
            categoria: null,
            categoriaTraduccion: null,
            usoJefe: false,
            esPatenteCompleta: false,
            error: null
        };

        updateDetailsDialog(result);

        expect(document.getElementById('categoria-container').style.display).toBe('none');
    });

    it('should hide capture button if esPatenteCompleta is false', () => {
        const result = {
            input: 'XX',
            codigo: 'XX',
            pais: 'Test Country',
            categoria: null,
            categoriaTraduccion: null,
            usoJefe: false,
            esPatenteCompleta: false,
            error: null
        };

        updateDetailsDialog(result);

        expect(document.getElementById('capturar').style.display).toBe('none');
    });

    it('should hide capture button if window.viewingCapturedPlate is true', () => {
        window.viewingCapturedPlate = true;
        const result = {
            input: 'D123XXA',
            codigo: 'XX',
            pais: 'Test Country',
            categoria: 'Test Category',
            categoriaTraduccion: 'T',
            usoJefe: true,
            esPatenteCompleta: true,
            error: null
        };

        updateDetailsDialog(result);

        expect(document.getElementById('capturar').style.display).toBe('none');
        expect(window.viewingCapturedPlate).toBe(false);
    });
});

describe('clearSearchParams', () => {
    it('should remove the patente parameter from the URL', () => {
        // Mock the window.location and window.history objects
        const mockURL = 'http://localhost/?patente=D123XXA';
        global.window = Object.create(window);
        Object.defineProperty(window, 'location', {
            value: {
                href: mockURL,
                search: '?patente=D123XXA'
            },
            writable: true
        });
        Object.defineProperty(window, 'history', {
            value: {
                replaceState: jest.fn()
            }
        });

        clearSearchParams();

        expect(window.history.replaceState).toHaveBeenCalledWith({}, '', 'http://localhost/');
    });
});

describe('handleCapturar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call addPatente with the correct parameters on successful geolocation', () => {
        const patenteValue = 'D123XXA';
        document.getElementById('patente').value = patenteValue;
        const addPatenteMock = jest.spyOn(global, 'addPatente').mockImplementation(() => {});
        global.navigator.geolocation = {
            getCurrentPosition: jest.fn((success) => success({
                coords: {
                    latitude: 10,
                    longitude: 20,
                },
            })),
        };

        handleCapturar();

        expect(addPatenteMock).toHaveBeenCalledWith(patenteValue, 10, 20);
    });

    it('should call showError when geolocation is blocked', () => {
        document.getElementById('patente').value = 'D123XXA';
        global.navigator.geolocation = {
            getCurrentPosition: jest.fn((success, error) => error({
                code: 1,
            })),
        };

        handleCapturar();

        expect(showError).toHaveBeenCalledWith("Por favor, permita el acceso a la ubicación para poder capturar la patente");
    });

    it('should call showError when geolocation returns an unknown error', () => {
        document.getElementById('patente').value = 'D123XXA';
        global.navigator.geolocation = {
            getCurrentPosition: jest.fn((success, error) => error({
                code: 2,
            })),
        };

        handleCapturar();

        expect(showError).toHaveBeenCalledWith("Error al obtener la ubicación");
    });

    it('should clear search params after capturing', () => {
        const patenteValue = 'D123XXA';
        document.getElementById('patente').value = patenteValue;
        const addPatenteMock = jest.spyOn(global, 'addPatente').mockImplementation(() => {});
        const clearSearchParamsMock = jest.spyOn(global, 'clearSearchParams').mockImplementation(() => {});
        global.navigator.geolocation = {
            getCurrentPosition: jest.fn((success) => success({
                coords: {
                    latitude: 10,
                    longitude: 20,
                },
            })),
        };

        handleCapturar();

        expect(addPatenteMock).toHaveBeenCalledWith(patenteValue, 10, 20);
        expect(clearSearchParamsMock).toHaveBeenCalled();
    });
});

describe('clearResults', () => {
    it('should clear the error element', () => {
        document.getElementById('error').innerHTML = 'Some error message';
        clearResults();
        expect(document.getElementById('error').innerHTML).toBe('');
    });
});

describe('addPatente', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorageGetItem('patentes', null);
        mockLocalStorageSetItem('patentes');
    });

    it('should add a new patente to localStorage', () => {
        const patente = 'D123XXA';
        const lat = 10;
        const lon = 20;

        addPatente(patente, lat, lon);

        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(showInfoDialog).toHaveBeenCalledWith("Éxito", "Patente capturada con éxito");
    });

    it('should update the list of captured plates', () => {
        const patente = 'D123XXA';
        const lat = 10;
        const lon = 20;
        const actualizarListaMock = jest.spyOn(global, 'actualizarLista').mockImplementation(() => {});

        addPatente(patente, lat, lon);

        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(actualizarListaMock).toHaveBeenCalled();
    });

    it('should handle existing patentes in localStorage', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'OLD',
            lat: 0,
            lon: 0,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        const patente = 'D123XXA';
        const lat = 10;
        const lon = 20;

        addPatente(patente, lat, lon);

        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(showInfoDialog).toHaveBeenCalledWith("Éxito", "Patente capturada con éxito");
    });
});

describe('actualizarLista', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorageGetItem('patentes', null);
        mockLocalStorageSetItem('patentes');
    });

    it('should display "No hay patentes capturadas" message when there are no patentes', () => {
        actualizarLista();

        expect(document.getElementById('patentes-capturadas').innerHTML).toContain('No hay patentes capturadas');
    });

    it('should display the list of captured plates when there are patentes', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        actualizarLista();

        expect(document.getElementById('patentes-capturadas').innerHTML).toContain('Patentes capturadas (1)');
    });

    it('should group patentes by their value', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
                patente: 'D123XXA',
                lat: 10,
                lon: 20,
                date: '2024-01-01T00:00:00.000Z'
            },
            {
                patente: 'D123XXA',
                lat: 11,
                lon: 21,
                date: '2024-01-02T00:00:00.000Z'
            },
            {
                patente: 'E456YYB',
                lat: 30,
                lon: 40,
                date: '2024-01-03T00:00:00.000Z'
            }
        ]));
        actualizarLista();

        const listElement = document.getElementById('patentes-lista');
        expect(listElement.children.length).toBe(2);
    });

    it('should add event listeners for buttons', (done) => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        actualizarLista();

        // Wait for the event listeners to be added
        setTimeout(() => {
            const exportarBtn = document.getElementById('exportar-btn');
            const importarBtn = document.getElementById('importar-btn');

            expect(exportarBtn).not.toBeNull();
            expect(importarBtn).not.toBeNull();

            done();
        }, 0);
    });

    it('should display date selector when there are multiple captures', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
                patente: 'D123XXA',
                lat: 10,
                lon: 20,
                date: '2024-01-01T00:00:00.000Z'
            },
            {
                patente: 'D123XXA',
                lat: 11,
                lon: 21,
                date: '2024-01-02T00:00:00.000Z'
            }
        ]));
        actualizarLista();

        const listElement = document.getElementById('patentes-lista');
        expect(listElement.innerHTML).toContain('Fecha:');
        expect(listElement.innerHTML).toContain('Todas las fechas (2)');
    });

    it('should display date as text when there is only one capture', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        actualizarLista();

        const listElement = document.getElementById('patentes-lista');
        expect(listElement.innerHTML).toContain('Fecha:');
        expect(listElement.innerHTML).not.toContain('<select');
    });

    it('should add dev buttons when devMode is true', () => {
        global.devMode = true;
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        actualizarLista();

        const listElement = document.getElementById('patentes-capturadas');
        expect(listElement.innerHTML).toContain('Crear');
        expect(listElement.innerHTML).toContain('Eliminar todo');
        global.devMode = false;
    });

    it('should not add dev buttons when devMode is false', () => {
        global.devMode = false;
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        actualizarLista();

        const listElement = document.getElementById('patentes-capturadas');
        expect(listElement.innerHTML).not.toContain('Crear');
        expect(listElement.innerHTML).not.toContain('Eliminar todo');
    });
});

describe('exportarPatentes', () => {
    it('should export patentes to a Base64 string', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        exportarPatentes();

        expect(document.getElementById('export-dialog').showModal).toHaveBeenCalled;
    });
});

describe('importarPatentes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorageGetItem('patentes', null);
        mockLocalStorageSetItem('patentes');
    });

    it('should show error if import code is empty', () => {
        document.getElementById('import-content').value = '';
        importarPatentes();
        expect(showError).toHaveBeenCalledWith('Por favor ingrese el código de importación');
    });

    it('should show error if import code is invalid', () => {
        document.getElementById('import-content').value = 'invalid code';
        importarPatentes();
        expect(showError).toHaveBeenCalledWith('El código de importación no es válido. Por favor verifique e intente nuevamente.');
    });

    it('should show confirmation dialog if user already has patentes saved locally', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'OLD',
            lat: 0,
            lon: 0,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        const base64Content = btoa(encodeURIComponent(JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }])));
        document.getElementById('import-content').value = base64Content;
        importarPatentes();
        expect(showConfirmDialog).toHaveBeenCalledWith(
            '¡Atención!',
            'Ya tienes patentes guardadas. Si continúas, todas las patentes existentes serán reemplazadas. ¿Estás seguro de que deseas continuar?',
            expect.any(Function),
            expect.any(Function)
        );
    });

    it('should perform import if user confirms', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'OLD',
            lat: 0,
            lon: 0,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        const base64Content = btoa(encodeURIComponent(JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }])));
        document.getElementById('import-content').value = base64Content;

        // Mock showConfirmDialog to call the confirm callback immediately
        showConfirmDialog.mockImplementation((title, message, onConfirm) => {
            onConfirm();
        });

        importarPatentes();

        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(showInfoDialog).toHaveBeenCalledWith("Éxito", "Patentes importadas con éxito");
    });

    it('should not perform import if user cancels', () => {
        mockLocalStorageGetItem('patentes', JSON.stringify([{
            patente: 'OLD',
            lat: 0,
            lon: 0,
            date: '2024-01-01T00:00:00.000Z'
        }]));
        const base64Content = btoa(encodeURIComponent(JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }])));
        document.getElementById('import-content').value = base64Content;

        // Mock showConfirmDialog to call the cancel callback immediately
        showConfirmDialog.mockImplementation((title, message, onConfirm, onCancel) => {
            onCancel();
        });

        importarPatentes();

        expect(localStorage.setItem).not.toHaveBeenCalled();
        expect(showInfoDialog).not.toHaveBeenCalled();
    });

    it('should import patentes from a Base64 string', () => {
        const base64Content = btoa(encodeURIComponent(JSON.stringify([{
            patente: 'D123XXA',
            lat: 10,
            lon: 20,
            date: '2024-01-01T00:00:00.000Z'
        }])));
        document.getElementById('import-content').value = base64Content;
        importarPatentes();

        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(showInfoDialog).toHaveBeenCalledWith("Éxito", "Patentes importadas con éxito");
    });
});

describe('handleListClick', () => {
    it('should handle ver-detalle click', () => {
        const event = {
            target: {
                id: 'ver-detalle',
                dataset: {
                    patente: 'D123XXA'
                }
            }
        };
        document.getElementById('form-patente').dispatchEvent = jest.fn();
        handleListClick(event);
        expect(document.getElementById('form-patente').dispatchEvent).toHaveBeenCalled;
    });

    it('should handle ver-mapa click', () => {
        const event = {
            target: {
                id: 'ver-mapa',
                dataset: {
                    patente: 'D123XXA',
                    locations: '[{"lat":10,"lon":20,"date":"2024-01-01T00:00:00.000Z"}]'
                }
            }
        };
        handleListClick(event);
        expect(showMap).toHaveBeenCalled;
    });

    it('should handle eliminar-grupo click', () => {
        const event = {
            target: {
                id: 'eliminar-grupo',
                dataset: {
                    patente: 'D123XXA'
                }
            }
        };
        handleListClick(event);
        expect(showConfirmDialog).toHaveBeenCalled;
    });

    it('should handle eliminar-individual click', () => {
        const event = {
            target: {
                id: 'eliminar-individual',
                dataset: {
                    patente: 'D123XXA',
                    globalIndex: '0'
                }
            }
        };
        handleListClick(event);
        expect(showConfirmDialog).toHaveBeenCalled;
    });

    it('should handle editar click', () => {
        const event = {
            target: {
                id: 'editar',
                dataset: {
                    patente: 'D123XXA',
                    lat: '10',
                    lon: '20'
                }
            }
        };
        handleListClick(event);
        expect(mostrarEditarPatenteDialog).toHaveBeenCalled;
    });
});

