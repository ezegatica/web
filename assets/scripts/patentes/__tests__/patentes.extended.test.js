import { sanitizeInput, updateDetailsDialog, clearResults, clearSearchParams, handleCapturar } from '../patentes';
import * as ui from '../ui';

// Mock the countries and categories modules
jest.mock('../data/countries', () => ({
  countries: {
    'US': 'Estados Unidos',
    'AR': 'Argentina',
    'UK': 'Reino Unido'
  }
}));

jest.mock('../data/categories', () => ({
  categories: {
    'D': 'Diplomático',
    'C': 'Consular',
    'A': 'Administrativo'
  }
}));

// Mock the ui module
jest.mock('../ui', () => ({
  showError: jest.fn(),
  showInfoDialog: jest.fn(),
  showConfirmDialog: jest.fn((title, message, onConfirm, onCancel) => {
    // Auto-confirm for testing
    if (onConfirm) onConfirm();
  }),
  showMap: jest.fn(),
  setupThemeToggle: jest.fn()
}));

describe('Extended tests for patentes.js', () => {
  // Setup DOM elements needed for tests
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup localStorage mock
    const localStorageMock = {
      getItem: jest.fn(() => JSON.stringify([])),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Setup document elements
    document.body.innerHTML = `
      <div id="error"></div>
      <form id="form-patente">
        <input id="patente" value="D123USA" />
        <button id="capturar" style="display: inline;">Capturar</button>
      </form>
      <div id="patente-detail-dialog">
        <span id="codigo-dialog"></span>
        <span id="traduccion-dialog"></span>
        <div id="categoria-container" style="display: none;">
          <span id="categoria-traduccion-dialog"></span>
          <span id="categoria-dialog"></span>
        </div>
        <div id="uso-jefe-dialog"></div>
        <div id="decomposition-container" style="display: none;">
          <div id="patente-visual"></div>
        </div>
      </div>
      <div id="patentes-capturadas"></div>
    `;
    
    // Add close method to dialog
    document.getElementById('patente-detail-dialog').close = jest.fn();
    
    // Mock window.history
    window.history.replaceState = jest.fn();
    
    // Mock URL constructor
    global.URL = jest.fn().mockImplementation((url) => ({
      href: url,
      searchParams: {
        delete: jest.fn(),
        get: jest.fn().mockImplementation((param) => {
          if (param === 'patente') return 'D123USA';
          return null;
        }),
        set: jest.fn()
      }
    }));
    
    // Fix navigator.geolocation mock
    global.navigator = {
      geolocation: {
        getCurrentPosition: jest.fn((success, error) => {
          success({ coords: { latitude: 10, longitude: 20 } });
        })
      }
    };
    
    // Ensure the mock is properly defined for override in tests
    Object.defineProperty(global, 'navigator', {
      value: {
        geolocation: {
          getCurrentPosition: jest.fn((success, error) => {
            success({ coords: { latitude: 10, longitude: 20 } });
          })
        }
      },
      writable: true,
      configurable: true
    });
  });

  describe('sanitizeInput function', () => {
    // Fix country codes test by manually injecting countries
    test('handles country code with lowercase input', () => {
      // Manually inject countries data to the module
      const countries = require('../data/countries').countries;
      countries.US = 'Estados Unidos';

      const result = sanitizeInput('us');
      expect(result.codigo).toBe('US');
      expect(result.pais).toBe('Estados Unidos');
      expect(result.error).toBe(null);
    });
    
    test('handles invalid country code', () => {
      const result = sanitizeInput('ZZ');
      expect(result.error).toBe('Código de país no encontrado');
    });
    
    test('handles invalid category in complete plate', () => {
      const result = sanitizeInput('Z123USA');
      expect(result.error).toBe('Categoría no encontrada');
    });
    
    test('handles invalid country in complete plate', () => {
      const result = sanitizeInput('D123ZZA');
      expect(result.error).toBe('Código de país no encontrado');
    });
    
    test('handles completely invalid format', () => {
      const result = sanitizeInput('ABC123');
      expect(result.error).toBe('Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra');
    });
    
    // Fix chief of mission test
    test('correctly identifies chief of mission usage', () => {
      // Make sure the necessary data is available
      const countries = require('../data/countries').countries;
      const categories = require('../data/categories').categories;
      
      countries.US = 'Estados Unidos';
      categories.D = 'Diplomático';
      
      const result = sanitizeInput('D123USA');
      expect(result.usoJefe).toBe(true); 
    });
    
    test('correctly identifies regular usage', () => {
      const result = sanitizeInput('D123USB');
      expect(result.usoJefe).toBe(false);
    });
  });

  describe('updateDetailsDialog function', () => {
    test('updates UI for country code only', () => {
      const result = {
        pais: 'Estados Unidos',
        codigo: 'US',
        categoria: null,
        categoriaTraduccion: null,
        usoJefe: false,
        esPatenteCompleta: false,
        input: 'US'  // Add input property to prevent undefined reference
      };
      
      updateDetailsDialog(result);
      
      expect(document.getElementById('traduccion-dialog').innerHTML).toBe('Estados Unidos');
      expect(document.getElementById('codigo-dialog').innerHTML).toBe('US: ');
      expect(document.getElementById('categoria-container').style.display).toBe('none');
      expect(document.getElementById('capturar').style.display).toBe('none');
    });
    
    test('updates UI for complete plate with chief usage', () => {
      const result = {
        pais: 'Estados Unidos',
        codigo: 'US',
        categoria: 'Diplomático',
        categoriaTraduccion: 'D',
        usoJefe: true,
        esPatenteCompleta: true,
        input: 'D123USA'
      };
      
      updateDetailsDialog(result);
      
      expect(document.getElementById('traduccion-dialog').innerHTML).toBe('Estados Unidos');
      expect(document.getElementById('codigo-dialog').innerHTML).toBe('US: ');
      expect(document.getElementById('categoria-container').style.display).toBe('block');
      expect(document.getElementById('categoria-traduccion-dialog').innerHTML).toBe('D: ');
      expect(document.getElementById('categoria-dialog').innerHTML).toBe('Diplomático');
      expect(document.getElementById('uso-jefe-dialog').innerHTML).toBe('<b>A</b>: Uso exclusivo de jefes de misiones diplomaticas');
      expect(document.getElementById('decomposition-container').style.display).toBe('block');
    });

    test('updates UI for complete plate without chief usage', () => {
      const result = {
        pais: 'Estados Unidos',
        codigo: 'US',
        categoria: 'Diplomático',
        categoriaTraduccion: 'D',
        usoJefe: false,
        esPatenteCompleta: true,
        input: 'D123USB'
      };
      
      updateDetailsDialog(result);
      
      expect(document.getElementById('uso-jefe-dialog').innerHTML).toBe('');
      expect(document.getElementById('capturar').style.display).toBe('inline');
    });

    test('handles already captured plate view', () => {
      window.viewingCapturedPlate = true;
      
      const result = {
        pais: 'Estados Unidos',
        codigo: 'US',
        categoria: 'Diplomático',
        categoriaTraduccion: 'D',
        usoJefe: true,
        esPatenteCompleta: true,
        input: 'D123USA'
      };
      
      updateDetailsDialog(result);
      
      expect(document.getElementById('capturar').style.display).toBe('none');
      expect(window.viewingCapturedPlate).toBe(false); // Should reset the flag
    });
  });

  describe('clearResults function', () => {
    test('clears error element content', () => {
      document.getElementById('error').innerHTML = 'Some error';
      clearResults();
      expect(document.getElementById('error').innerHTML).toBe('');
    });
  });

  describe('clearSearchParams function', () => {
    test('removes patente parameter from URL', () => {
      clearSearchParams();
      expect(window.history.replaceState).toHaveBeenCalled();
    });
  });

  describe('handleCapturar function', () => {
    test('gets current position and captures plate', () => {
      // Ensure patente-detail-dialog has a close method
      const dialog = document.getElementById('patente-detail-dialog');
      dialog.close = jest.fn();
      
      // Mock localStorage.getItem to return empty array
      localStorage.getItem.mockReturnValue('[]');
      
      handleCapturar();
      
      // Verify geolocation was called
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
      
      // Verify localStorage was updated
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'patentes',
        expect.stringContaining('D123USA')
      );
      
      // Verify dialog was closed
      expect(dialog.close).toHaveBeenCalled();
      
      // Verify success message was shown
      expect(ui.showInfoDialog).toHaveBeenCalledWith('Éxito', 'Patente capturada con éxito');
    });

    test('handles geolocation error', () => {
      // Override the geolocation mock safely
      navigator.geolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
        error({ code: 1 }); // Permission denied error
      });
      
      handleCapturar();
      
      expect(ui.showError).toHaveBeenCalledWith('Por favor, permita el acceso a la ubicación para poder capturar la patente');
    });

    test('handles other geolocation errors', () => {
      // Override the geolocation mock safely
      navigator.geolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
        error({ code: 2 }); // Other error
      });
      
      // Mock console.error
      console.error = jest.fn();
      
      handleCapturar();
      
      expect(console.error).toHaveBeenCalled();
      expect(ui.showError).toHaveBeenCalledWith('Error al obtener la ubicación');
    });
  });

  // Add more tests here to cover other functionalities
});
