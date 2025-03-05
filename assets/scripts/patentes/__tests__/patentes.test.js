import { clearResults, sanitizeInput, updateDetailsDialog, handleCapturar, clearSearchParams } from '../patentes.js';
import { countries } from '../data/countries.js';
import { categories } from '../data/categories.js';
import { showError, showInfoDialog, showConfirmDialog, showMap } from '../ui.js';

// Mock UI functions
jest.mock('../ui.js', () => ({
  showError: jest.fn(),
  showInfoDialog: jest.fn(),
  showConfirmDialog: jest.fn(),
  showMap: jest.fn(),
  setupThemeToggle: jest.fn()
}));

// Directly access the patentes module
const patentesModule = require('../patentes.js');

describe('sanitizeInput', () => {
	// Test with valid 2-letter country code
	test('returns valid result for a valid 2-letter code', () => {
		const input = "AA";
		const result = sanitizeInput(input);
		expect(result.codigo).toBe("AA");
		expect(result.pais).toBe(countries["AA"]);
		expect(result.error).toBeNull();
	});
  
	// Test with invalid 2-letter country code
	test('returns error for an unknown 2-letter code', () => {
		const input = "ZZ";
		const result = sanitizeInput(input);
		expect(result.error).toBe("Código de país no encontrado");
	});
  
	// Test with complete license plate that is invalid (unknown country)
	test('returns error for a complete plate with unknown country code', () => {
		// Using plate "D123XXA": category "D" exists but "XX" not in countries.
		const input = "D123XXA";
		const result = sanitizeInput(input);
		expect(result.esPatenteCompleta).toBe(true);
		expect(result.categoria).toBe(categories["D"]);
		expect(result.error).toBe("Código de país no encontrado");
	});
  
	// Test with a valid complete license plate (usage true)
	test('returns valid result for a complete plate with usage flag true', () => {
		// Valid full plate "D123AAA": category "D", country "AA" exists, last letter A => usoJefe true.
		const input = "D123AAA";
		const result = sanitizeInput(input);
		expect(result.esPatenteCompleta).toBe(true);
		expect(result.categoria).toBe(categories["D"]);
		expect(result.pais).toBe(countries["AA"]);
		expect(result.usoJefe).toBe(true);
		expect(result.error).toBeNull();
	});
  
	// Test with a valid complete license plate (usage false)
	test('returns valid result for a complete plate with usage flag false', () => {
		// With last letter not "A"
		const input = "D123AAB";
		const result = sanitizeInput(input);
		expect(result.esPatenteCompleta).toBe(true);
		expect(result.categoria).toBe(categories["D"]);
		expect(result.pais).toBe(countries["AA"]);
		expect(result.usoJefe).toBe(false);
		expect(result.error).toBeNull();
	});
  
	// Test with an input that does not match any pattern
	test('returns error for completely invalid format', () => {
		const input = "invalid";
		const result = sanitizeInput(input);
		expect(result.error).toBe("Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra");
	});
});

describe('clearResults', () => {
	test('clears innerHTML of error element', () => {
		document.body.innerHTML = `<div id="error">Some error message</div>`;
		clearResults();
		const errorEl = document.getElementById('error');
		expect(errorEl.innerHTML).toBe("");
	});
});

describe('updateDetailsDialog', () => {
  beforeEach(() => {
    // Setup minimal DOM elements needed:
    document.body.innerHTML = `
      <div id="traduccion-dialog"></div>
      <div id="codigo-dialog"></div>
      <div id="categoria-traduccion-dialog"></div>
      <div id="categoria-dialog"></div>
      <div id="categoria-container"></div>
      <div id="uso-jefe-dialog"></div>
      <div id="patente-visual"></div>
      <div id="decomposition-container"></div>
      <button id="capturar"></button>
    `;
  });

  test('updates dialog for complete plate with category and usoJefe', () => {
    const result = {
      pais: "SANTA SEDE",
      codigo: "AA",
      categoria: categories["D"],
      categoriaTraduccion: "D",
      usoJefe: true,
      esPatenteCompleta: true,
      input: "D123AAA",
      error: null
    };
    updateDetailsDialog(result);
    expect(document.getElementById('traduccion-dialog').innerHTML).toBe("SANTA SEDE");
    expect(document.getElementById('codigo-dialog').innerHTML).toContain("AA:");
    // Categoria fields should be visible:
    expect(document.getElementById('categoria-container').style.display).toBe('block');
    // usoJefe should set innerHTML on uso-jefe-dialog:
    expect(document.getElementById('uso-jefe-dialog').innerHTML).toContain("Uso exclusivo");
    // For complete plate, capture button should be visible unless flag is set.
    expect(document.getElementById('capturar').style.display).toBe("inline");
  });

  test('hides category container if category is missing', () => {
    const result = {
      pais: "SANTA SEDE",
      codigo: "AA",
      categoria: null,
      categoriaTraduccion: null,
      usoJefe: false,
      esPatenteCompleta: false,
      input: "AA",
      error: null
    };
    updateDetailsDialog(result);
    expect(document.getElementById('categoria-container').style.display).toBe('none');
    // The capture button must be hidden for incomplete plates
    expect(document.getElementById('capturar').style.display).toBe("none");
  });
});

// Test the exported handleCapturar
describe('handleCapturar', () => {
  const realGeolocation = navigator.geolocation;

  beforeAll(() => {
    global.HTMLDialogElement.prototype.showModal = jest.fn();
    global.HTMLDialogElement.prototype.close = jest.fn();
  });

  afterEach(() => {
    // Restore original geolocation
    navigator.geolocation = realGeolocation;
    // Reset localStorage and DOM changes
    localStorage.clear();
    document.body.innerHTML = "";
  });

  test('should capture patente and update localStorage on successful geolocation', (done) => {
    // Setup DOM elements needed for handleCapturar
    document.body.innerHTML = `
      <input id="patente" value="TEST123">
      <dialog id="patente-detail-dialog"></dialog>
      <div id="patentes-capturadas"></div>
    `;

    // Spy on close of patente-detail-dialog
    const dialog = document.getElementById('patente-detail-dialog');
    dialog.close = jest.fn();

    // Mock geolocation.getCurrentPosition to simulate success
    navigator.geolocation = {
      getCurrentPosition: (success) => {
        success({ coords: { latitude: 10, longitude: 20 } });
      }
    };

    handleCapturar();

    // Allow any asynchronous behavior (if any) to finish.
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem('patentes'));
      expect(stored).toBeInstanceOf(Array);
      expect(stored[0].patente).toBe("TEST123");
      expect(stored[0].lat).toBe(10);
      expect(stored[0].lon).toBe(20);
      expect(dialog.close).toHaveBeenCalled();
      done();
    }, 0);
  });

  test('should show error when geolocation fails with error code 1', () => {
    // Setup DOM elements
    document.body.innerHTML = `
      <input id="patente" value="TEST123">
      <dialog id="patente-detail-dialog"></dialog>
    `;

    // Mock geolocation failure with code 1.
    navigator.geolocation = {
      getCurrentPosition: (success, errorCallback) => {
        errorCallback({ code: 1 });
      }
    };

    handleCapturar();
    
    // Check that showError was called with appropriate message
    expect(showError).toHaveBeenCalledWith("Por favor, permita el acceso a la ubicación para poder capturar la patente");
  });
});

describe('clearSearchParams', () => {
  test('removes patente param from URL', () => {
    const initialUrl = window.location.href;
    window.history.pushState({}, '', '?patente=XYZ');
    clearSearchParams();
    expect(window.location.search).not.toContain('patente');
    // Restore
    window.history.replaceState({}, '', initialUrl);
  });
});

describe('updateVisualDecomposition', () => {
  beforeEach(() => {
    // Include all necessary DOM elements for updateVisualDecomposition and updateDetailsDialog
    document.body.innerHTML = `
      <div id="patente-visual"></div>
      <div id="decomposition-container"></div>
      <div id="categoria-traduccion-dialog"></div>
      <div id="categoria-dialog"></div>
      <div id="categoria-container"></div>
      <div id="uso-jefe-dialog"></div>
      <div id="traduccion-dialog"></div>
      <div id="codigo-dialog"></div>
      <button id="capturar"></button>
    `;
  });
  
  test('creates spans for complete plate', () => {
    // Call updateDetailsDialog indirectly updates visual decomposition
    const result = {
      input: "D123AAB",
      esPatenteCompleta: true,
      pais: "SANTA SEDE",
      codigo: "AA",
      categoria: "CUERPO DIPLOMATICO",
      categoriaTraduccion: "D",
      usoJefe: false
    };
    updateDetailsDialog(result);
    const visual = document.getElementById('patente-visual');
    expect(visual.children.length).toBe(4);
    expect(visual.querySelector('.part-categoria').textContent).toBe("D");
  });

  test('shows only country code for 2-letter input', () => {
    const result = {
      input: "AA",
      esPatenteCompleta: false,
      codigo: "AA",
      pais: "SANTA SEDE",
      categoria: null,
      categoriaTraduccion: null,
      usoJefe: false
    };
    updateDetailsDialog(result);
    const visual = document.getElementById('patente-visual');
    expect(visual.children.length).toBe(1);
    expect(visual.querySelector('.part-pais').textContent).toBe("AA");
  });
});

// Direct tests for internal functions
describe('guardarPatente function', () => {
  beforeEach(() => {
    // Reset mocks
    showError.mockClear();
    
    // Setup DOM with only required elements
    document.body.innerHTML = `
      <form id="patente-form" data-action="crear">
        <input id="form-patente-id" value="">
        <input id="form-lat" value="">
        <input id="form-lon" value="">
      </form>
      <dialog id="patente-form-dialog"></dialog>
    `;
    
    document.getElementById('patente-form-dialog').close = jest.fn();
  });
  
  test('shows error when fields are missing', () => {
    // Create mock event
    const event = { preventDefault: jest.fn() };
    
    // Call the function directly
    patentesModule.guardarPatente(event);
    
    // Check that showError was called
    expect(showError).toHaveBeenCalledWith('Todos los campos son obligatorios');
  });
});

describe('processUrlParams function', () => {
  beforeEach(() => {
    // Setup minimal DOM
    document.body.innerHTML = `
      <form id="form-patente">
        <input id="patente" value="">
      </form>
    `;
  });
  
  test('fills input with patente from URL and submits form', () => {
    const initialUrl = window.location.href;
    window.history.pushState({}, '', '?patente=TEST123');
    
    // Mock form.dispatchEvent
    const form = document.getElementById('form-patente');
    form.dispatchEvent = jest.fn();
    
    // Call function directly
    patentesModule.processUrlParams();
    
    // Check that input was filled and form was submitted
    expect(document.getElementById('patente').value).toBe('TEST123');
    expect(form.dispatchEvent).toHaveBeenCalled();
    
    // Restore URL
    window.history.replaceState({}, '', initialUrl);
  });
  
  test('does nothing if no patente in URL', () => {
    const initialUrl = window.location.href;
    window.history.pushState({}, '', '?otherParam=value');
    
    // Mock form.dispatchEvent
    const form = document.getElementById('form-patente');
    form.dispatchEvent = jest.fn();
    
    // Call function directly
    patentesModule.processUrlParams();
    
    // Check that input was not filled
    expect(document.getElementById('patente').value).toBe('');
    expect(form.dispatchEvent).not.toHaveBeenCalled();
    
    // Restore URL
    window.history.replaceState({}, '', initialUrl);
  });
});

describe('toggleDevMode function', () => {
  // Store original method in a closure-scoped variable
  let originalReplaceState;
  
  beforeEach(() => {
    // Create minimally required DOM elements
    document.body.innerHTML = '<div id="patentes-capturadas"></div>';
    
    // Reset mocks
    showInfoDialog.mockClear();
    
    // Mock the global state
    global.devMode = false;
    
    // Store original method and replace with mock
    originalReplaceState = window.history.replaceState;
    window.history.replaceState = jest.fn();
  });
  
  afterEach(() => {
    // Restore original method
    window.history.replaceState = originalReplaceState;
  });
  
  test('enables dev mode when called', () => {
    // Call the function directly
    patentesModule.toggleDevMode();
    
    // Check results
    expect(document.body.classList.contains('dev-mode')).toBe(true);
    expect(showInfoDialog).toHaveBeenCalledWith('Modo desarrollador', expect.any(String));
    expect(window.history.replaceState).toHaveBeenCalled();
  });
});

describe('handleListClick function', () => {
  beforeEach(() => {
    // Reset mocks
    showConfirmDialog.mockClear();
    showMap.mockClear();
    
    // Set up mock DOM with the required elements
    document.body.innerHTML = `
      <input id="patente" value="">
      <form id="form-patente"></form>
    `;
    
    // Mock form.dispatchEvent
    document.getElementById('form-patente').dispatchEvent = jest.fn();
  });
  
  test('handles ver-detalle click', () => {
    // Create mock event with target
    const mockEvent = {
      target: {
        id: 'ver-detalle',
        dataset: {
          patente: 'TEST123'
        }
      }
    };
    
    // Call function directly
    patentesModule.handleListClick(mockEvent);
    
    // Check results
    expect(document.getElementById('patente').value).toBe('TEST123');
    expect(document.getElementById('form-patente').dispatchEvent).toHaveBeenCalled();
  });
  
  test('handles ver-mapa click', () => {
    // Create mock event with target
    const testLocations = [{ lat: 10, lon: 20 }];
    const mockEvent = {
      target: {
        id: 'ver-mapa',
        dataset: {
          patente: 'TEST123',
          locations: JSON.stringify(testLocations)
        }
      }
    };
    
    // Call function directly
    patentesModule.handleListClick(mockEvent);
    
    // Check that showMap was called
    expect(showMap).toHaveBeenCalledWith(testLocations, 'TEST123');
  });
  
  test('handles eliminar-grupo click', () => {
    // Create mock event with target
    const mockEvent = {
      target: {
        id: 'eliminar-grupo',
        dataset: {
          patente: 'TEST123'
        }
      }
    };
    
    // Call function directly
    patentesModule.handleListClick(mockEvent);
    
    // Check that showConfirmDialog was called
    expect(showConfirmDialog).toHaveBeenCalled();
    expect(showConfirmDialog.mock.calls[0][0]).toBe('¿Eliminar patente?');
    expect(showConfirmDialog.mock.calls[0][1]).toContain('TEST123');
  });
});

// New tests for export/import functionality
describe('Export and Import functions', () => {
  beforeEach(() => {
    // Setup DOM for export/import tests
    document.body.innerHTML = `
      <dialog id="export-dialog">
        <textarea id="export-content"></textarea>
        <button id="close-export"></button>
        <button id="copy-export"></button>
      </dialog>
      <dialog id="import-dialog">
        <textarea id="import-content"></textarea>
        <button id="close-import"></button>
        <button id="confirm-import"></button>
      </dialog>
      <div id="patentes-capturadas"></div>
    `;
    
    // Mock dialog methods
    document.getElementById('export-dialog').showModal = jest.fn();
    document.getElementById('export-dialog').close = jest.fn();
    document.getElementById('import-dialog').showModal = jest.fn();
    document.getElementById('import-dialog').close = jest.fn();
    
    // Reset mocks
    showError.mockClear();
    showInfoDialog.mockClear();
    showConfirmDialog.mockClear();

    // Mock document.execCommand for copy operation
    document.execCommand = jest.fn();
    
    // Create a sample plate in localStorage
    const samplePlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(samplePlates));

    // Mock global btoa and atob functions
    global.btoa = jest.fn(str => `base64_encoded_${str}`);
    global.atob = jest.fn(str => str.replace('base64_encoded_', ''));
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    delete global.btoa;
    delete global.atob;
  });

  test('exportarPatentes function encodes plates and updates UI', () => {
    // Get internal function reference
    const { exportarPatentes } = patentesModule;
    
    // Run the function
    exportarPatentes();
    
    // Check dialog was shown
    expect(document.getElementById('export-dialog').showModal).toHaveBeenCalled();
    
    // Check textarea content
    const textarea = document.getElementById('export-content');
    expect(textarea.value).toBe('base64_encoded_' + encodeURIComponent(localStorage.getItem('patentes')));
    
    // Check select was called on textarea
    expect(textarea.select).toHaveBeenCalled();
  });

  test('mostrarImportarDialog shows import dialog', () => {
    // Get internal function reference
    const { mostrarImportarDialog } = patentesModule;
    
    // Run function
    mostrarImportarDialog();
    
    // Check dialog was shown
    expect(document.getElementById('import-dialog').showModal).toHaveBeenCalled();
  });

  test('importarPatentes shows error when input is empty', () => {
    // Get internal function reference
    const { importarPatentes } = patentesModule;
    
    // Set empty content
    document.getElementById('import-content').value = '';
    
    // Run function
    importarPatentes();
    
    // Check error was shown
    expect(showError).toHaveBeenCalledWith('Por favor ingrese el código de importación');
  });

  test('importarPatentes shows error when content is invalid', () => {
    // Get internal function reference
    const { importarPatentes } = patentesModule;
    
    // Set invalid content
    document.getElementById('import-content').value = 'invalid_content';
    global.atob.mockImplementationOnce(() => { throw new Error('Invalid base64'); });
    
    // Run function
    importarPatentes();
    
    // Check error was shown
    expect(showError).toHaveBeenCalledWith(
      'El código de importación no es válido. Por favor verifique e intente nuevamente.'
    );
  });

  test('importarPatentes imports data when content is valid and no existing plates', () => {
    // Get internal function reference
    const { importarPatentes } = patentesModule;
    
    // Clear existing plates
    localStorage.clear();
    
    // Create valid import content
    const importPlates = [{ patente: 'DEF456', lat: 30, lon: 40, date: '2023-02-02T12:00:00.000Z' }];
    const importBase64 = btoa(encodeURIComponent(JSON.stringify(importPlates)));
    document.getElementById('import-content').value = importBase64;
    
    // Run function
    importarPatentes();
    
    // Check imported content
    expect(JSON.parse(localStorage.getItem('patentes'))).toEqual(importPlates);
    expect(document.getElementById('import-dialog').close).toHaveBeenCalled();
    expect(showInfoDialog).toHaveBeenCalledWith('Éxito', 'Patentes importadas con éxito');
  });

  test('importarPatentes shows confirmation when existing plates are found', () => {
    // Get internal function reference
    const { importarPatentes } = patentesModule;
    
    // Create valid import content
    const importPlates = [{ patente: 'DEF456', lat: 30, lon: 40, date: '2023-02-02T12:00:00.000Z' }];
    const importBase64 = btoa(encodeURIComponent(JSON.stringify(importPlates)));
    document.getElementById('import-content').value = importBase64;
    
    // Run function
    importarPatentes();
    
    // Check confirmation dialog was shown
    expect(showConfirmDialog).toHaveBeenCalledWith(
      '¡Atención!',
      expect.stringContaining('Ya tienes patentes guardadas'),
      expect.any(Function),
      expect.any(Function)
    );
  });

  test('performImport updates localStorage and UI', () => {
    // Get internal function reference
    const { performImport } = patentesModule;
    
    // Sample import data
    const importPlates = [{ patente: 'DEF456', lat: 30, lon: 40, date: '2023-02-02T12:00:00.000Z' }];
    
    // Run function
    performImport(importPlates);
    
    // Check localStorage was updated
    expect(JSON.parse(localStorage.getItem('patentes'))).toEqual(importPlates);
    expect(document.getElementById('import-dialog').close).toHaveBeenCalled();
    expect(showInfoDialog).toHaveBeenCalledWith('Éxito', 'Patentes importadas con éxito');
  });
});

// Tests for actualizarLista and related UI functionality
describe('actualizarLista functionality', () => {
  beforeEach(() => {
    // Setup DOM for actualizarLista tests
    document.body.innerHTML = `
      <div id="patentes-capturadas"></div>
    `;
    
    // Reset mocks
    jest.resetAllMocks();
  });

  test('actualizarLista shows "No hay patentes" message when no plates exist', () => {
    // Clear localStorage
    localStorage.clear();
    
    // Call the function
    patentesModule.actualizarLista();
    
    // Check the container has the correct message
    const container = document.getElementById('patentes-capturadas');
    expect(container.innerHTML).toContain('No hay patentes capturadas');
  });

  test('actualizarLista shows plates when they exist in localStorage', () => {
    // Create sample plates
    const samplePlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(samplePlates));
    
    // Call the function
    patentesModule.actualizarLista();
    
    // Check the container has the plate
    const container = document.getElementById('patentes-capturadas');
    expect(container.innerHTML).toContain('ABC123');
  });

  test('actualizarLista creates buttons with correct event listeners', () => {
    // Setup DOM for buttons
    document.body.innerHTML = `
      <div id="patentes-capturadas"></div>
      <dialog id="export-dialog"></dialog>
      <dialog id="import-dialog"></dialog>
    `;
    
    // Create sample plates
    const samplePlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(samplePlates));
    
    // Mock showModal method for dialogs
    const exportDialog = document.createElement('dialog');
    exportDialog.showModal = jest.fn();
    document.getElementById('export-dialog').showModal = exportDialog.showModal;
    
    const importDialog = document.createElement('dialog');
    importDialog.showModal = jest.fn();
    document.getElementById('import-dialog').showModal = importDialog.showModal;
    
    // Call the function
    patentesModule.actualizarLista();
    
    // Get the generated buttons
    setTimeout(() => {
      const exportButton = document.getElementById('exportar-btn');
      const importButton = document.getElementById('importar-btn');
      
      // Click the export button
      if (exportButton) {
        exportButton.click();
        expect(document.getElementById('export-dialog').showModal).toHaveBeenCalled();
      }
      
      // Click the import button
      if (importButton) {
        importButton.click();
        expect(document.getElementById('import-dialog').showModal).toHaveBeenCalled();
      }
    }, 0);
  });

  test('actualizarLista creates list items with correct structure', () => {
    // Create sample plates
    const samplePlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(samplePlates));
    
    // Call the function
    patentesModule.actualizarLista();
    
    // Check the list contains the correct structure
    setTimeout(() => {
      const list = document.getElementById('patentes-lista');
      expect(list).not.toBeNull();
      
      // Check for ver-detalle button
      const verDetalleBtn = list.querySelector('#ver-detalle');
      expect(verDetalleBtn).not.toBeNull();
      expect(verDetalleBtn.dataset.patente).toBe('ABC123');
      
      // Check for ver-mapa button
      const verMapaBtn = list.querySelector('#ver-mapa');
      expect(verMapaBtn).not.toBeNull();
      expect(verMapaBtn.dataset.patente).toBe('ABC123');
      
      // Check for eliminar-grupo button
      const eliminarBtn = list.querySelector('#eliminar-grupo');
      expect(eliminarBtn).not.toBeNull();
      expect(eliminarBtn.dataset.patente).toBe('ABC123');
    }, 0);
  });
});

// Tests for editing and creating patentes
describe('Crear and Editar patentes functionality', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <dialog id="patente-form-dialog">
        <h2 id="patente-form-title"></h2>
        <form id="patente-form">
          <input id="form-patente-id" value="">
          <input id="form-lat" value="">
          <input id="form-lon" value="">
          <button type="submit">Guardar</button>
        </form>
      </dialog>
      <div id="patentes-capturadas"></div>
    `;
    
    document.getElementById('patente-form-dialog').showModal = jest.fn();
    document.getElementById('patente-form-dialog').close = jest.fn();
    
    // Reset mocks
    showError.mockClear();
    showInfoDialog.mockClear();
  });
  
  test('mostrarCrearPatenteDialog sets up form correctly', () => {
    // Call the function
    patentesModule.mostrarCrearPatenteDialog();
    
    // Check form setup
    const dialog = document.getElementById('patente-form-dialog');
    const title = document.getElementById('patente-form-title');
    const form = document.getElementById('patente-form');
    
    expect(dialog.showModal).toHaveBeenCalled();
    expect(title.textContent).toBe('Crear Nueva Patente');
    expect(form.dataset.action).toBe('crear');
    
    // Inputs should be empty
    expect(document.getElementById('form-patente-id').value).toBe('');
    expect(document.getElementById('form-lat').value).toBe('');
    expect(document.getElementById('form-lon').value).toBe('');
  });
  
  test('mostrarEditarPatenteDialog sets up form with existing values', () => {
    // Call the function with sample data
    patentesModule.mostrarEditarPatenteDialog('ABC123', 10.5, 20.5);
    
    // Check form setup
    const dialog = document.getElementById('patente-form-dialog');
    const title = document.getElementById('patente-form-title');
    const form = document.getElementById('patente-form');
    
    expect(dialog.showModal).toHaveBeenCalled();
    expect(title.textContent).toBe('Editar Patente');
    expect(form.dataset.action).toBe('editar');
    expect(form.dataset.originalPatente).toBe('ABC123');
    
    // Inputs should have the provided values
    expect(document.getElementById('form-patente-id').value).toBe('ABC123');
    expect(document.getElementById('form-lat').value).toBe('10.5');
    expect(document.getElementById('form-lon').value).toBe('20.5');
  });
  
  test('guardarPatente creates new plate when action is crear', () => {
    // Setup form with test data
    const form = document.getElementById('patente-form');
    form.dataset.action = 'crear';
    
    document.getElementById('form-patente-id').value = 'DEF456';
    document.getElementById('form-lat').value = '30.5';
    document.getElementById('form-lon').value = '40.5';
    
    // Mock Date.now() for predictable date
    const originalDate = global.Date;
    const mockDate = new Date('2023-03-03T12:00:00Z');
    global.Date = class extends Date {
      constructor() {
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    };
    
    // Trigger form submission
    const event = { preventDefault: jest.fn() };
    patentesModule.guardarPatente(event);
    
    // Check localStorage was updated
    const stored = JSON.parse(localStorage.getItem('patentes'));
    expect(stored).toHaveLength(1);
    expect(stored[0].patente).toBe('DEF456');
    expect(stored[0].lat).toBe(30.5);
    expect(stored[0].lon).toBe(40.5);
    expect(stored[0].date).toBe(mockDate.toISOString());
    
    // Check dialog was closed
    expect(document.getElementById('patente-form-dialog').close).toHaveBeenCalled();
    
    // Restore Date
    global.Date = originalDate;
  });
  
  test('guardarPatente edits existing plate when action is editar', () => {
    // Set up initial plate in localStorage
    const initialPlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(initialPlates));
    
    // Setup form with test data for editing
    const form = document.getElementById('patente-form');
    form.dataset.action = 'editar';
    form.dataset.originalPatente = 'ABC123';
    
    document.getElementById('form-patente-id').value = 'ABC456';
    document.getElementById('form-lat').value = '15.5';
    document.getElementById('form-lon').value = '25.5';
    
    // Trigger form submission
    const event = { preventDefault: jest.fn() };
    patentesModule.guardarPatente(event);
    
    // Check localStorage was updated
    const stored = JSON.parse(localStorage.getItem('patentes'));
    expect(stored).toHaveLength(1);
    expect(stored[0].patente).toBe('ABC456');
    expect(stored[0].lat).toBe(15.5);
    expect(stored[0].lon).toBe(25.5);
    expect(stored[0].date).toBe('2023-01-01T12:00:00.000Z'); // Date should remain the same
    
    // Check dialog was closed
    expect(document.getElementById('patente-form-dialog').close).toHaveBeenCalled();
  });
  
  test('confirmarEliminarTodo shows confirmation dialog and deletes all plates when confirmed', () => {
    // Set up initial plates in localStorage
    const initialPlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' },
      { patente: 'DEF456', lat: 30, lon: 40, date: '2023-02-02T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(initialPlates));
    
    // Mock showConfirmDialog to immediately execute the confirm callback
    showConfirmDialog.mockImplementation((title, message, onConfirm) => {
      onConfirm();
    });
    
    // Call the function
    patentesModule.confirmarEliminarTodo();
    
    // Check localStorage was cleared
    expect(localStorage.getItem('patentes')).toBe('[]');
    expect(showInfoDialog).toHaveBeenCalledWith('Operación completada', 'Todas las patentes han sido eliminadas');
  });
});

// Tests for initialization and setup functions
describe('initialization functions', () => {
  let originalLocation;
  
  beforeEach(() => {
    // Store original location
    originalLocation = window.location;
    
    // Define a mutable version of location for testing
    delete window.location;
    window.location = {
      href: 'https://example.com',
      search: '',
      replace: jest.fn()
    };
    
    // Reset document body
    document.body.innerHTML = `
      <h1 id="page-title">Patentes Diplomáticas</h1>
      <form id="form-patente">
        <input id="patente" value="">
      </form>
      <button id="dev-mode-toggle"></button>
      <dialog id="error-dialog"><button id="close-error"></button></dialog>
      <dialog id="map-dialog"><button id="close-map"></button></dialog>
      <dialog id="export-dialog">
        <button id="close-export"></button>
        <button id="copy-export"></button>
        <textarea id="export-content"></textarea>
      </dialog>
      <dialog id="import-dialog">
        <button id="close-import"></button>
        <button id="confirm-import"></button>
      </dialog>
      <dialog id="patente-detail-dialog">
        <button id="close-detail"></button>
      </dialog>
      <dialog id="patente-form-dialog"></dialog>
      <form id="patente-form">
        <button id="cancel-patente-form"></button>
      </form>
      <div id="patentes-capturadas"></div>
    `;
    
    // Mock dialog methods
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
      dialog.showModal = jest.fn();
      dialog.close = jest.fn();
    });
    
    // Reset global state of patentesModule
    jest.resetModules();
  });
  
  afterEach(() => {
    // Restore original location
    window.location = originalLocation;
  });
  
  test('initApp calls all setup functions', () => {
    // Spy on all setup functions
    const setupFormHandlersSpy = jest.spyOn(patentesModule, 'setupFormHandlers');
    const setupDialogHandlersSpy = jest.spyOn(patentesModule, 'setupDialogHandlers');
    const setupDevModeHandlersSpy = jest.spyOn(patentesModule, 'setupDevModeHandlers');
    const checkDevModeInUrlSpy = jest.spyOn(patentesModule, 'checkDevModeInUrl');
    const processUrlParamsSpy = jest.spyOn(patentesModule, 'processUrlParams');
    const actualizarListaSpy = jest.spyOn(patentesModule, 'actualizarLista');
    const setupDialogOutsideClickHandlersSpy = jest.spyOn(patentesModule, 'setupDialogOutsideClickHandlers');
    
    // Call initApp
    patentesModule.initApp();
    
    // Check if all setup functions were called
    expect(setupFormHandlersSpy).toHaveBeenCalled();
    expect(setupDialogHandlersSpy).toHaveBeenCalled();
    expect(setupDevModeHandlersSpy).toHaveBeenCalled();
    expect(setupThemeToggle).toHaveBeenCalled();
    expect(checkDevModeInUrlSpy).toHaveBeenCalled();
    expect(processUrlParamsSpy).toHaveBeenCalled();
    expect(actualizarListaSpy).toHaveBeenCalled();
    expect(setupDialogOutsideClickHandlersSpy).toHaveBeenCalled();
  });
  
  test('setupFormHandlers attaches form events', () => {
    // Get access to internal function
    const setupFormHandlers = patentesModule.setupFormHandlers;
    
    // Mock form elements
    const form = document.getElementById('form-patente');
    form.addEventListener = jest.fn();
    form.reset = jest.fn();
    
    const capturarButton = document.createElement('button');
    capturarButton.id = 'capturar';
    capturarButton.addEventListener = jest.fn();
    document.body.appendChild(capturarButton);
    
    // Call the function
    setupFormHandlers();
    
    // Verify event listeners were attached
    expect(form.addEventListener).toHaveBeenCalledTimes(2);
    expect(form.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function));
    expect(form.addEventListener).toHaveBeenCalledWith('reset', expect.any(Function));
    expect(capturarButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });
  
  test('setupDialogHandlers attaches events to dialog buttons', () => {
    // Get access to internal function
    const setupDialogHandlers = patentesModule.setupDialogHandlers;
    
    // Set up spy on addEventListener for all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener = jest.fn();
    });
    
    // Execute the function
    setupDialogHandlers();
    
    // Check that event listeners were attached to all relevant buttons
    expect(document.getElementById('close-map').addEventListener)
      .toHaveBeenCalledWith('click', expect.any(Function));
    expect(document.getElementById('close-export').addEventListener)
      .toHaveBeenCalledWith('click', expect.any(Function));
    expect(document.getElementById('copy-export').addEventListener)
      .toHaveBeenCalledWith('click', expect.any(Function));
    expect(document.getElementById('close-import').addEventListener)
      .toHaveBeenCalledWith('click', expect.any(Function));
    expect(document.getElementById('confirm-import').addEventListener)
      .toHaveBeenCalledWith('click', expect.any(Function));
    expect(document.getElementById('close-error').addEventListener)
      .toHaveBeenCalledWith('click', expect.any(Function));
    expect(document.getElementById('close-detail').addEventListener)
      .toHaveBeenCalledWith('click', expect.any(Function));
    expect(document.getElementById('cancel-patente-form').addEventListener)
      .toHaveBeenCalledWith('click', expect.any(Function));
  });
  
  test('setupDevModeHandlers attaches click handlers for dev mode', () => {
    // Get access to internal function
    const setupDevModeHandlers = patentesModule.setupDevModeHandlers;
    
    // Mock title and dev mode toggle
    const pageTitle = document.getElementById('page-title');
    pageTitle.addEventListener = jest.fn();
    
    const devModeToggle = document.getElementById('dev-mode-toggle');
    devModeToggle.addEventListener = jest.fn();
    
    // Execute the function
    setupDevModeHandlers();
    
    // Verify event listeners were attached
    expect(pageTitle.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(devModeToggle.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });
  
  test('setupDialogOutsideClickHandlers attaches click handlers to dialogs', () => {
    // Get access to internal function
    const setupDialogOutsideClickHandlers = patentesModule.setupDialogOutsideClickHandlers;
    
    // Replace addEventListener on dialogs with a mock
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
      dialog.addEventListener = jest.fn();
    });
    
    // Execute the function
    setupDialogOutsideClickHandlers();
    
    // Verify event listeners were attached to each dialog
    dialogs.forEach(dialog => {
      expect(dialog.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });
  
  test('checkDevModeInUrl enables dev mode when URL has dev parameter', () => {
    // Set up URL with dev parameter
    window.location.search = '?dev';
    window.location.href = 'https://example.com/?dev';
    
    // Get access to internal function
    const checkDevModeInUrl = patentesModule.checkDevModeInUrl;
    
    // Execute the function
    checkDevModeInUrl();
    
    // Check if dev mode was enabled
    expect(document.body.classList.contains('dev-mode')).toBe(true);
  });
});

// Test for adding a new patente
describe('addPatente function', () => {
  beforeEach(() => {
    // Clear localStorage and set up DOM
    localStorage.clear();
    document.body.innerHTML = '<div id="patentes-capturadas"></div>';
    
    // Mock showInfoDialog
    showInfoDialog.mockClear();
    
    // Mock actualizarLista
    jest.spyOn(patentesModule, 'actualizarLista').mockImplementation(() => {});
    
    // Mock Date.now for predictable dates
    const mockDate = new Date('2023-04-04T10:00:00Z');
    global.Date = class extends Date {
      constructor() {
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    };
  });
  
  afterEach(() => {
    // Restore original Date
    global.Date = Date;
  });
  
  test('adds a new plate to localStorage', () => {
    // Access internal function
    const addPatente = patentesModule.addPatente;
    
    // Execute the function
    addPatente('TEST123', 10.5, 20.5);
    
    // Check localStorage was updated
    const patentes = JSON.parse(localStorage.getItem('patentes'));
    expect(patentes).toHaveLength(1);
    expect(patentes[0].patente).toBe('TEST123');
    expect(patentes[0].lat).toBe(10.5);
    expect(patentes[0].lon).toBe(20.5);
    expect(patentes[0].date).toBe(new Date().toISOString());
    
    // Check notification was shown
    expect(showInfoDialog).toHaveBeenCalledWith('Éxito', 'Patente capturada con éxito');
    
    // Check list was updated
    expect(patentesModule.actualizarLista).toHaveBeenCalled();
  });
});

// Tests for special functions in actualizarLista
describe('actualizarLista special cases', () => {
  beforeEach(() => {
    // Setup DOM for tests
    document.body.innerHTML = `
      <div id="patentes-capturadas"></div>
      <dialog id="patente-form-dialog"></dialog>
    `;
    
    // Mock showModal for dialogs
    document.getElementById('patente-form-dialog').showModal = jest.fn();
    
    // Clear localStorage
    localStorage.clear();
  });
  
  test('handles patentes with multiple captures', () => {
    // Create plates with multiple captures of the same plate
    const multipleCapturesPlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' },
      { patente: 'ABC123', lat: 30, lon: 40, date: '2023-01-02T12:00:00.000Z' },
      { patente: 'DEF456', lat: 50, lon: 60, date: '2023-01-03T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(multipleCapturesPlates));
    
    // Call actualizarLista
    patentesModule.actualizarLista();
    
    // Verify date select element was created for the plate with multiple captures
    const dateSelect = document.getElementById('date-select-ABC123');
    expect(dateSelect).not.toBeNull();
    
    // Verify the other plate doesn't have a date select
    const dateSelectDef = document.getElementById('date-select-DEF456');
    expect(dateSelectDef.tagName.toLowerCase()).toBe('input'); // Should be an input type="hidden"
  });
  
  test('dev mode shows additional buttons', () => {
    // Create a sample plate
    const samplePlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(samplePlates));
    
    // Set dev mode
    document.body.classList.add('dev-mode');
    global.devMode = true;
    
    // Call actualizarLista
    patentesModule.actualizarLista();
    
    // Check for dev mode specific buttons
    setTimeout(() => {
      const crearBtn = document.getElementById('crear-btn');
      const eliminarTodoBtn = document.getElementById('eliminar-todo-btn');
      
      expect(crearBtn).not.toBeNull();
      expect(eliminarTodoBtn).not.toBeNull();
    }, 0);
  });
});

// Test for date select change handling in captured plates
describe('date select change handling', () => {
  beforeEach(() => {
    // Setup DOM for tests
    document.body.innerHTML = '<div id="patentes-capturadas"></div>';
    
    // Setup multiple captures of the same plate
    const multipleCapturesPlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' },
      { patente: 'ABC123', lat: 30, lon: 40, date: '2023-01-02T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(multipleCapturesPlates));
    
    // Set dev mode to test edit button
    global.devMode = true;
    document.body.classList.add('dev-mode');
  });
  
  test('updates location data and UI elements when date is changed', (done) => {
    // Call actualizarLista to generate the DOM
    patentesModule.actualizarLista();
    
    // Wait for setTimeout to execute in actualizarLista
    setTimeout(() => {
      // Get date select
      const dateSelect = document.getElementById('date-select-ABC123');
      expect(dateSelect).not.toBeNull();
      
      // Find buttons before change
      const verMapaBtn = document.querySelector('#ver-mapa');
      const eliminarBtn = document.querySelector('#eliminar-grupo');
      
      // Store original data
      const originalLocations = verMapaBtn.dataset.locations;
      
      // Trigger date select change
      const changeEvent = new Event('change');
      dateSelect.value = '0'; // Select first instance
      dateSelect.dispatchEvent(changeEvent);
      
      // Check that button IDs and data were updated
      expect(document.querySelector('#eliminar-individual')).not.toBeNull(); // ID should change
      expect(verMapaBtn.dataset.locations).not.toBe(originalLocations); // Locations should be updated
      
      // Check that edit button was created
      const editarBtn = document.querySelector('#editar');
      expect(editarBtn).not.toBeNull();
      
      // Now change back to "all"
      dateSelect.value = 'all';
      dateSelect.dispatchEvent(changeEvent);
      
      // Check that buttons were updated again
      expect(document.querySelector('#eliminar-grupo')).not.toBeNull(); // ID should change back
      expect(verMapaBtn.dataset.locations).toBe(originalLocations); // Locations should be restored
      
      // Edit button should be hidden
      expect(editarBtn.style.display).toBe('none');
      
      done();
    }, 10);
  });
});

// Tests for eliminar-individual handling
describe('eliminar-individual handling', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="patentes-capturadas"></div>
    `;
    
    // Create multiple plates
    const multipleCaptures = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' },
      { patente: 'ABC123', lat: 30, lon: 40, date: '2023-01-02T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(multipleCaptures));
    
    // Mock showConfirmDialog to execute callback immediately
    showConfirmDialog.mockImplementation((title, message, onConfirm) => {
      onConfirm();
    });
  });
  
  test('removes specific instance of a plate when eliminar-individual is clicked', (done) => {
    // Generate the DOM
    patentesModule.actualizarLista();
    
    setTimeout(() => {
      // Get date select and change to a specific instance
      const dateSelect = document.getElementById('date-select-ABC123');
      dateSelect.value = '0';
      dateSelect.dispatchEvent(new Event('change'));
      
      // Now should have eliminar-individual button
      const eliminarIndividualBtn = document.querySelector('#eliminar-individual');
      expect(eliminarIndividualBtn).not.toBeNull();
      
      // Create mock event for handleListClick
      const mockEvent = {
        target: eliminarIndividualBtn
      };
      
      // Call handleListClick
      patentesModule.handleListClick(mockEvent);
      
      // Check localStorage - should only have one instance left
      const storedPatentes = JSON.parse(localStorage.getItem('patentes'));
      expect(storedPatentes.length).toBe(1);
      expect(storedPatentes[0].lat).toBe(30); // Second instance should remain
      
      done();
    }, 10);
  });
});

// Test editar function
describe('editar functionality', () => {
  beforeEach(() => {
    // Setup DOM with necessary elements
    document.body.innerHTML = `
      <div id="patentes-capturadas"></div>
      <dialog id="patente-form-dialog">
        <h2 id="patente-form-title"></h2>
        <form id="patente-form">
          <input id="form-patente-id" value="">
          <input id="form-lat" value="">
          <input id="form-lon" value="">
        </form>
      </dialog>
    `;
    
    document.getElementById('patente-form-dialog').showModal = jest.fn();
    
    // Create sample plate
    const samplePlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(samplePlates));
    
    // Enable dev mode
    global.devMode = true;
    document.body.classList.add('dev-mode');
  });
  
  test('editar button sets up and shows form dialog', (done) => {
    // Generate the list with edit button
    patentesModule.actualizarLista();
    
    setTimeout(() => {
      // Find the edit button
      const editarBtn = document.querySelector('#editar');
      expect(editarBtn).not.toBeNull();
      
      // Create mock event
      const mockEvent = {
        target: editarBtn
      };
      
      // Call handleListClick
      patentesModule.handleListClick(mockEvent);
      
      // Check if dialog was shown with correct data
      expect(document.getElementById('patente-form-dialog').showModal).toHaveBeenCalled();
      expect(document.getElementById('form-patente-id').value).toBe('ABC123');
      expect(document.getElementById('form-lat').value).toBe('10');
      expect(document.getElementById('form-lon').value).toBe('20');
      expect(document.getElementById('patente-form').dataset.action).toBe('editar');
      
      done();
    }, 10);
  });
});

// Test form submit handling for case where one plate was modified
describe('guardarPatente with existing plate editing', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <form id="patente-form" data-action="editar" data-original-patente="ABC123">
        <input id="form-patente-id" value="XYZ789">
        <input id="form-lat" value="50">
        <input id="form-lon" value="60">
      </form>
      <dialog id="patente-form-dialog"></dialog>
      <div id="patentes-capturadas"></div>
    `;
    
    document.getElementById('patente-form-dialog').close = jest.fn();
    
    // Create initial plates
    const initialPlates = [
      { patente: 'ABC123', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' },
      { patente: 'DEF456', lat: 30, lon: 40, date: '2023-01-02T12:00:00.000Z' }
    ];
    localStorage.setItem('patentes', JSON.stringify(initialPlates));
    
    // Mock actualizarLista to avoid DOM manipulation
    jest.spyOn(patentesModule, 'actualizarLista').mockImplementation(() => {});
  });
  
  test('updates existing plate while preserving date when editing', () => {
    // Create event object
    const event = { preventDefault: jest.fn() };
    
    // Call guardarPatente
    patentesModule.guardarPatente(event);
    
    // Check localStorage
    const updatedPatentes = JSON.parse(localStorage.getItem('patentes'));
    expect(updatedPatentes.length).toBe(2);
    
    // Find the updated patente
    const updatedPatente = updatedPatentes.find(p => p.patente === 'XYZ789');
    expect(updatedPatente).not.toBeNull();
    expect(updatedPatente.lat).toBe(50);
    expect(updatedPatente.lon).toBe(60);
    expect(updatedPatente.date).toBe('2023-01-01T12:00:00.000Z'); // Original date should be preserved
    
    // Check that the other plate is still there
    const otherPatente = updatedPatentes.find(p => p.patente === 'DEF456');
    expect(otherPatente).not.toBeNull();
    
    // Check that dialog was closed
    expect(document.getElementById('patente-form-dialog').close).toHaveBeenCalled();
    
    // Check that list was updated
    expect(patentesModule.actualizarLista).toHaveBeenCalled();
  });
});

// Test the copy-export functionality
describe('copy-export functionality', () => {
  beforeEach(() => {
    // Setup DOM with export dialog
    document.body.innerHTML = `
      <dialog id="export-dialog">
        <textarea id="export-content">test-content</textarea>
        <button id="copy-export"></button>
      </dialog>
    `;
    
    // Mock document.execCommand
    document.execCommand = jest.fn();
    
    // Mock showInfoDialog
    showInfoDialog.mockClear();
  });
  
  test('copies export content to clipboard on button click', () => {
    // Get the event handler
    const copyExportHandler = patentesModule.copyExportHandler;
    
    // Call the handler
    copyExportHandler();
    
    // Check that textarea was selected
    expect(document.getElementById('export-content').select).toHaveBeenCalled();
    
    // Check that copy command was executed
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    
    // Check that success message was shown
    expect(showInfoDialog).toHaveBeenCalledWith('Copiado', 'Código copiado al portapapeles');
  });
});