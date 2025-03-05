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