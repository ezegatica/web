/**
 * Comprehensive tests for patentes module including:
 * - Input validation
 * - Geolocation capture
 * - Dev mode
 * - Dialog updates
 * - Import/Export
 */
import { 
  sanitizeInput, clearResults, handleCapturar, 
  updateDetailsDialog, initApp
} from '../patentes.js';
import { showError, showInfoDialog, showConfirmDialog } from '../ui.js';
import { 
  setupDomMocks, setupStorageMocks, setupElementMock, 
  setupGeolocationMock
} from './test-utils.js';

// Mock UI module
jest.mock('../ui.js', () => ({
  showError: jest.fn(),
  showInfoDialog: jest.fn(),
  showConfirmDialog: jest.fn((title, message, onConfirm, onCancel) => {
    if (onConfirm) onConfirm();
    return { addEventListener: jest.fn(), dataset: {} };
  }),
  setupThemeToggle: jest.fn(),
  showMap: jest.fn(),
}));

describe('Patentes Application', () => {
  beforeEach(() => {
    setupDomMocks();
    const { localStorageMock } = setupStorageMocks();
    setupGeolocationMock();
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Reset app state
    window.devMode = false;
    window.devModeClicks = 0;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Input Validation', () => {
    test('should parse country code correctly', () => {
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
    
    test('should parse complete license plate', () => {
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
    
    test('should handle various error cases', () => {
      // Invalid country code
      expect(sanitizeInput('XX').error).toBe('Código de país no encontrado');
      
      // Invalid category
      expect(sanitizeInput('X001BGA').error).toBe('Categoría no encontrada');
      
      // Invalid country in complete patente
      expect(sanitizeInput('D001XXA').error).toBe('Código de país no encontrado');
      
      // Invalid format
      expect(sanitizeInput('INVALID').error).toContain('Formato inválido');
      
      // Empty input
      expect(sanitizeInput('').error).toContain('Formato inválido');
      
      // Whitespace
      expect(sanitizeInput('   ').error).toContain('Formato inválido');
      
      // Malformed
      expect(sanitizeInput('D12BG').error).toContain('Formato inválido');
      
      // Wrong length country code
      expect(sanitizeInput('BGX').error).toContain('Formato inválido');
      
      // Country code with numbers
      expect(sanitizeInput('B1').error).toContain('Formato inválido');
    });
    
    test('should clear error messages', () => {
      const mockErrorElement = { innerHTML: 'Some error' };
      setupElementMock({ 'error': mockErrorElement });
      
      clearResults();
      
      expect(mockErrorElement.innerHTML).toBe('');
    });
  });

  describe('Geolocation and Capture', () => {
    test('should add patente with location when geolocation succeeds', () => {
      setupElementMock({
        'patente': { value: 'D001BGA' },
        'patente-detail-dialog': { close: jest.fn() }
      });
      
      handleCapturar();
      
      // Check localStorage was updated
      expect(window.localStorage.setItem).toHaveBeenCalledWith('patentes', expect.any(String));
      expect(showInfoDialog).toHaveBeenCalledWith("Éxito", "Patente capturada con éxito");
      expect(document.getElementById('patente-detail-dialog').close).toHaveBeenCalled();
    });
    
    test('should show error when geolocation permission is denied', () => {
      // Override default geolocation mock to fail
      setupGeolocationMock(false);
      
      handleCapturar();
      
      expect(showError).toHaveBeenCalledWith("Por favor, permita el acceso a la ubicación para poder capturar la patente");
    });
  });

  describe('Dialog Updates', () => {
    test('updateDetailsDialog should handle complete patente', () => {
      const mockElements = {
        'traduccion-dialog': { innerHTML: '' },
        'codigo-dialog': { innerHTML: '' },
        'categoria-traduccion-dialog': { innerHTML: '' },
        'categoria-dialog': { innerHTML: '' },
        'categoria-container': { style: { display: 'none' } },
        'uso-jefe-dialog': { innerHTML: '' },
        'patente-visual': { innerHTML: '' },
        'decomposition-container': { style: { display: 'none' } },
        'capturar': { style: { display: 'none' } }
      };
      setupElementMock(mockElements);
      
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
      
      expect(document.getElementById('categoria-traduccion-dialog').innerHTML).toBe('D: ');
      expect(document.getElementById('categoria-dialog').innerHTML).toBe('CUERPO DIPLOMATICO');
      expect(document.getElementById('uso-jefe-dialog').innerHTML).toContain('Uso exclusivo de jefes');
      expect(document.getElementById('capturar').style.display).toBe('inline');
    });
    
    test('updateDetailsDialog should handle country code only', () => {
      const mockElements = {
        'traduccion-dialog': { innerHTML: '' },
        'codigo-dialog': { innerHTML: '' },
        'categoria-traduccion-dialog': { innerHTML: '' },
        'categoria-dialog': { innerHTML: '' },
        'categoria-container': { style: { display: 'block' } },
        'uso-jefe-dialog': { innerHTML: '' },
        'patente-visual': { innerHTML: '' },
        'decomposition-container': { style: { display: 'none' } },
        'capturar': { style: { display: 'inline' } }
      };
      setupElementMock(mockElements);
      
      const result = {
        input: 'BG',
        codigo: 'BG',
        pais: 'REINO DE ESPAÑA',
        categoria: null,
        categoriaTraduccion: null,
        usoJefe: false,
        esPatenteCompleta: false
      };
      
      updateDetailsDialog(result);
      
      expect(document.getElementById('categoria-container').style.display).toBe('none');
      expect(document.getElementById('uso-jefe-dialog').innerHTML).toBe('');
      expect(document.getElementById('capturar').style.display).toBe('none');
    });
  });

  describe('Dev Mode', () => {
    beforeEach(() => {
      // Reset dev mode state
      window.devMode = false;
      window.devModeClicks = 0;
    });
    
    test('initApp should activate dev mode from URL parameter', () => {
      // Set up URL params to include dev
      const { mockSearchParams } = setupCommonMocks();
      mockSearchParams.has.mockImplementation(key => key === 'dev');
      setupElementMock();
      
      initApp();
      
      expect(document.body.classList.add).toHaveBeenCalledWith('dev-mode');
    });
    
    test('should toggle dev mode after 5 clicks on page title', () => {
      setupElementMock();
      initApp();
      
      // Get the stored click handler
      const clickHandler = document.getElementById.pageTitleClickHandler;
      
      // Simulate 5 clicks
      for (let i = 0; i < 5; i++) {
        clickHandler();
      }
      
      expect(document.body.classList.add).toHaveBeenCalledWith('dev-mode');
      expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", expect.any(String));
    });
    
    test('should toggle off dev mode when already active', () => {
      setupElementMock();
      
      // Set initial state
      window.devMode = true;
      document.body.classList.contains.mockReturnValue(true);
      
      initApp();
      
      // Get dev toggle click handler and click it
      const clickHandler = document.getElementById.devToggleClickHandler;
      clickHandler();
      
      expect(document.body.classList.remove).toHaveBeenCalledWith('dev-mode');
      expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", "Modo desarrollador desactivado");
    });
  });
});
