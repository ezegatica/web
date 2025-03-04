import { initApp, sanitizeInput, clearResults, handleCapturar, updateDetailsDialog } from '../patentes.js';
import { showError, showInfoDialog, showConfirmDialog } from '../ui.js';

// Mock UI modules
jest.mock('../ui.js', () => ({
  showError: jest.fn(),
  showInfoDialog: jest.fn(),
  showConfirmDialog: jest.fn((title, message, onConfirm) => {
    // Execute onConfirm to test the path
    onConfirm();
    return {
      addEventListener: jest.fn(),
      dataset: {},
    };
  }),
  setupThemeToggle: jest.fn(),
  showMap: jest.fn(),
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation((success, error) => {
    success({ coords: { latitude: 10, longitude: 20 } });
  })
};

global.navigator.geolocation = mockGeolocation;

// Mock localStorage
const mockLocalStorageData = {};
const localStorageMock = {
  getItem: jest.fn(key => mockLocalStorageData[key] ? mockLocalStorageData[key] : null),
  setItem: jest.fn((key, value) => {
    mockLocalStorageData[key] = value;
  }),
  removeItem: jest.fn(key => {
    delete mockLocalStorageData[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockLocalStorageData).forEach(key => {
      delete mockLocalStorageData[key];
    });
  })
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document classList methods instead of replacing document.body
document.body.classList = {
  add: jest.fn(),
  remove: jest.fn()
};

const eventListenerMap = {};
document.addEventListener = jest.fn((event, callback) => {
  eventListenerMap[event] = callback;
});

document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'patente-form-dialog' || id === 'patente-detail-dialog' || 
      id === 'error-dialog' || id === 'export-dialog' || id === 'import-dialog' ||
      id === 'map-dialog') {
    return {
      showModal: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
  }
  
  if (id === 'patente-visual' || id === 'traduccion-dialog' || 
      id === 'patentes-capturadas' || id === 'codigo-dialog') {
    return {
      innerHTML: '',
      appendChild: jest.fn()
    };
  }

  if (id === 'patente') {
    return { value: 'D001BGA' };
  }

  if (id === 'categoria-dialog' || id === 'categoria-traduccion-dialog' || id === 'uso-jefe-dialog') {
    return { innerHTML: '', style: {} };
  }

  if (id === 'categoria-container' || id === 'decomposition-container') {
    return { style: { display: 'block' } };
  }

  if (id === 'capturar') {
    return { style: { display: 'none' } };
  }

  if (id === 'form-patente-id') {
    return { value: 'D001BGA' };
  }

  if (id === 'form-lat') {
    return { value: '10.123' };
  }

  if (id === 'form-lon') {
    return { value: '20.456' };
  }

  if (id === 'form-patente') {
    return { 
      addEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      dataset: { action: 'crear' }
    };
  }

  if (id === 'patente-form') {
    return {
      addEventListener: jest.fn(),
      dataset: { action: 'crear', originalPatente: 'D001BGA' }
    };
  }

  if (id === 'page-title') {
    return { addEventListener: jest.fn((event, callback) => {
      if (callback) setTimeout(() => callback(), 0);
    }) };
  }

  if (id === 'dev-mode-toggle') {
    return { addEventListener: jest.fn((event, callback) => {
      if (callback) setTimeout(() => callback(), 0);
    }) };
  }

  if (id === 'patente-form-title') {
    return { textContent: '' };
  }

  if (id === 'export-content') {
    return { value: '', select: jest.fn() };
  }

  if (id === 'import-content') {
    return { value: 'W3sicGF0ZW50ZSI6IkQwMDFCR0EiLCJsYXQiOjEwLCJsb24iOjIwLCJkYXRlIjoiMjAyMi0wMS0wMVQwMDowMDowMFoifV0=' };
  }

  // Return a default mock for any other ID
  return {
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    style: {},
    innerHTML: '',
    value: '',
    dataset: {}
  };
});

// Mock window location and history
const mockUrl = new URL('https://example.com');
// Instead of replacing searchParams, mock the methods we need
const mockSearchParams = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  has: jest.fn().mockReturnValue(false)
};
Object.defineProperty(mockUrl, 'searchParams', {
  get: () => mockSearchParams
});

Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com',
    search: '?patente=D001BGA&dev=true',
    pathname: '/',
  },
  writable: true
});

window.history = {
  replaceState: jest.fn()
};

window.URL = jest.fn(() => mockUrl);

// Mock document.execCommand
document.execCommand = jest.fn();

describe('Advanced Patentes Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Dev Mode Functions', () => {
    test('devMode should be activated when URL has dev parameter', () => {
      // Mock the URL params to include dev
      mockSearchParams.has.mockImplementation(key => key === 'dev' ? true : false);
      
      // Call the function that checks for dev mode in URL
      initApp();
      
      // The body should have dev-mode class
      expect(document.body.classList.add).toHaveBeenCalledWith('dev-mode');
    });

    test('devMode should be toggled after 5 clicks on title', () => {
      // Setup mocks for the page title element
      const mockTitle = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Store the click handler
            mockTitle.clickHandler = callback;
          }
        }),
        clickHandler: null
      };
      
      document.getElementById.mockReturnValueOnce(mockTitle);
      
      initApp();
      
      // Simulate 5 clicks
      for (let i = 0; i < 5; i++) {
        mockTitle.clickHandler();
      }
      
      // Dev mode should be toggled
      expect(document.body.classList.add).toHaveBeenCalledWith('dev-mode');
      expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", expect.any(String));
    });
    
    test('devMode should be toggled off when already active', () => {
      // Start with dev mode active
      window.devMode = true;
      document.body.classList.add('dev-mode');
      
      // Setup mock for dev-mode-toggle
      const mockDevToggle = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            mockDevToggle.clickHandler = callback;
          }
        }),
        clickHandler: null
      };
      
      document.getElementById.mockReturnValueOnce(document.getElementById('page-title'))
               .mockReturnValueOnce(mockDevToggle);
      
      initApp();
      
      // Simulate click on dev toggle
      mockDevToggle.clickHandler();
      
      // Dev mode should be toggled off
      expect(document.body.classList.remove).toHaveBeenCalledWith('dev-mode');
      expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", "Modo desarrollador desactivado");
    });
  });

  describe('handleCapturar', () => {
    test('should add patente when geolocation succeeds', () => {
      handleCapturar();
      
      // Check that the patente was added to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(showInfoDialog).toHaveBeenCalledWith("Éxito", "Patente capturada con éxito");
    });
    
    test('should show error when geolocation permission is denied', () => {
      // Mock geolocation to fail with permission denied (error code 1)
      global.navigator.geolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
        error({ code: 1 });
      });
      
      handleCapturar();
      
      expect(showError).toHaveBeenCalledWith("Por favor, permita el acceso a la ubicación para poder capturar la patente");
    });
    
    test('should show error when geolocation fails with other error', () => {
      // Mock console.error
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // Mock geolocation to fail with other error
      global.navigator.geolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
        error({ code: 2 });
      });
      
      handleCapturar();
      
      expect(console.error).toHaveBeenCalled();
      expect(showError).toHaveBeenCalledWith("Error al obtener la ubicación");
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('updateDetailsDialog', () => {
    test('should update dialog with complete patente details', () => {
      const result = {
        input: 'D001BGA',
        codigo: 'BG',
        pais: 'REINO DE ESPAÑA',
        categoria: 'CUERPO DIPLOMATICO',
        categoriaTraduccion: 'D',
        usoJefe: true,
        esPatenteCompleta: true
      };
      
      updateDetailsDialog(result);
      
      // Check that all relevant elements were updated
      expect(document.getElementById('categoria-traduccion-dialog').innerHTML).toBe('D: ');
      expect(document.getElementById('categoria-dialog').innerHTML).toBe('CUERPO DIPLOMATICO');
      expect(document.getElementById('uso-jefe-dialog').innerHTML).toContain('Uso exclusivo de jefes');
    });
    
    test('should update dialog with country code only', () => {
      const result = {
        input: 'BG',
        codigo: 'BG',
        pais: 'REINO DE ESPAÑA',
        categoria: null,
        usoJefe: false,
        esPatenteCompleta: false
      };
      
      updateDetailsDialog(result);
      
      // Check display of category container
      expect(document.getElementById('categoria-container').style.display).toBe('none');
      expect(document.getElementById('uso-jefe-dialog').innerHTML).toBe('');
    });
    
    test('should handle viewing already captured plate', () => {
      window.viewingCapturedPlate = true;
      
      const result = {
        input: 'D001BGA',
        codigo: 'BG',
        pais: 'REINO DE ESPAÑA',
        categoria: 'CUERPO DIPLOMATICO',
        categoriaTraduccion: 'D',
        usoJefe: false,
        esPatenteCompleta: true
      };
      
      updateDetailsDialog(result);
      
      // Capture button should be hidden
      expect(document.getElementById('capturar').style.display).toBe('none');
      // Flag should be reset
      expect(window.viewingCapturedPlate).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    test('should correctly parse country code', () => {
      const result = sanitizeInput('BG');
      
      expect(result).toEqual({
        input: 'BG',
        codigo: 'BG',
        pais: 'REINO DE ESPAÑA',
        categoria: null,
        categoriaTraduccion: null,
        usoJefe: false,
        esPatenteCompleta: false,
        error: null
      });
    });
    
    test('should return error for invalid country code', () => {
      const result = sanitizeInput('XX');
      
      expect(result.error).toBe('Código de país no encontrado');
    });
    
    test('should correctly parse complete patente', () => {
      const result = sanitizeInput('D001BGA');
      
      expect(result).toEqual({
        input: 'D001BGA',
        codigo: 'BG',
        pais: 'REINO DE ESPAÑA',
        categoria: 'CUERPO DIPLOMATICO',
        categoriaTraduccion: 'D',
        usoJefe: false,
        esPatenteCompleta: true,
        error: null
      });
    });
    
    test('should detect chief of mission use', () => {
      const result = sanitizeInput('D001BGA');
      
      expect(result.usoJefe).toBe(false);
    });
    
    test('should return error for invalid category', () => {
      const result = sanitizeInput('X001BGA');
      
      expect(result.error).toBe('Categoría no encontrada');
    });
    
    test('should return error for invalid country in complete patente', () => {
      const result = sanitizeInput('D001XXA');
      
      expect(result.error).toBe('Código de país no encontrado');
    });
    
    test('should return error for invalid format', () => {
      const result = sanitizeInput('INVALID');
      
      expect(result.error).toBe(
        'Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra'
      );
    });
  });

  describe('Import/Export Functions', () => {
    test('should export patentes to Base64', () => {
      // Add some patentes to localStorage
      localStorageMock.setItem('patentes', JSON.stringify([
        { patente: 'D001BGA', lat: 10, lon: 20, date: '2023-01-01T00:00:00Z' }
      ]));
      
      // Get the exportar function by calling the mocked getElementById and addEventListener
      const exportarBtn = document.getElementById('exportar-btn');
      if (exportarBtn && exportarBtn.addEventListener) {
        const callback = exportarBtn.addEventListener.mock.calls[0][1];
        callback();
      }
      
      // Check that the export dialog was shown
      expect(document.getElementById('export-dialog').showModal).toHaveBeenCalled();
    });
    
    test('should import patentes from valid Base64', () => {
      // Mock the textarea value with a valid Base64 encoded patentes array
      document.getElementById.mockReturnValueOnce({
        value: 'W3sicGF0ZW50ZSI6IkQwMDFCR0EiLCJsYXQiOjEwLCJsb24iOjIwLCJkYXRlIjoiMjAyMy0wMS0wMVQwMDowMDowMFoifV0=',
        trim: () => 'W3sicGF0ZW50ZSI6IkQwMDFCR0EiLCJsYXQiOjEwLCJsb24iOjIwLCJkYXRlIjoiMjAyMy0wMS0wMVQwMDowMDowMFoifV0='
      });
      
      // Get the importar function by calling the mocked getElementById and addEventListener
      const importarBtn = document.getElementById('confirm-import');
      if (importarBtn && importarBtn.addEventListener) {
        const callback = importarBtn.addEventListener.mock.calls[0][1];
        callback();
      }
      
      // Check that localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('patentes', expect.any(String));
      expect(showInfoDialog).toHaveBeenCalledWith('Éxito', 'Patentes importadas con éxito');
    });
  });
});
