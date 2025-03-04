import { initApp } from '../patentes';
import * as ui from '../ui';
import { setupCommonMocks, setupElementMock } from './test-utils.js';
import { showInfoDialog, showConfirmDialog } from '../ui.js';

// Mock the ui module
jest.mock('../ui', () => ({
  showError: jest.fn(),
  showInfoDialog: jest.fn(),
  showConfirmDialog: jest.fn((title, message, onConfirm, onCancel) => {
    // Execute onConfirm to simulate user confirmation
    onConfirm();
    return { addEventListener: jest.fn() };
  }),
  showMap: jest.fn(),
  setupThemeToggle: jest.fn()
}));

// Mock document.execCommand
document.execCommand = jest.fn();

describe('Import & Export Functionality', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    
    // Mock storage data before each test
    window.localStorage.clear();
  });

  describe('Export', () => {
    test('should export patentes to Base64 format', () => {
      // Setup mock elements for export
      const mockElements = {
        'export-dialog': { showModal: jest.fn() },
        'export-content': { value: '', select: jest.fn() },
        'exportar-btn': {
          addEventListener: jest.fn((event, callback) => {
            // Store the callback for later execution
            window.exportCallback = callback;
          })
        }
      };
      setupElementMock(mockElements);
      
      // Add sample data to localStorage
      const testData = [{ patente: 'D001BGA', lat: 10, lon: 20, date: '2023-01-01T00:00:00Z' }];
      window.localStorage.setItem('patentes', JSON.stringify(testData));
      
      // Simulate page load and initialization - this would register all event listeners
      // Usually done in initApp() but we're testing the export function directly
      require('../patentes.js');
      
      // Find and execute the export callback
      window.exportCallback();
      
      // Check dialog was shown
      expect(document.getElementById('export-dialog').showModal).toHaveBeenCalled();
      
      // Check content was set and selected
      expect(document.getElementById('export-content').value).toBeTruthy();
      expect(document.getElementById('export-content').select).toHaveBeenCalled();
      
      // Clean up global
      delete window.exportCallback;
    });
    
    test('should copy export content to clipboard', () => {
      // Setup mock elements for copy functionality
      const mockElements = {
        'export-content': { value: 'W3sicGF0ZW50ZSI6IkQwMDFCR0EifQ==', select: jest.fn() },
        'copy-export': {
          addEventListener: jest.fn((event, callback) => {
            window.copyCallback = callback;
          })
        }
      };
      setupElementMock(mockElements);
      
      // Simulate page init
      require('../patentes.js');
      
      // Execute copy callback
      window.copyCallback();
      
      // Check text was selected and copied
      expect(document.getElementById('export-content').select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(showInfoDialog).toHaveBeenCalledWith("Copiado", expect.any(String));
      
      delete window.copyCallback;
    });
  });

  describe('Import', () => {
    test('should import valid Base64 data', () => {
      // Setup mock elements
      const encodedData = 'W3sicGF0ZW50ZSI6IkQwMDFCR0EiLCJsYXQiOjEwLCJsb24iOjIwLCJkYXRlIjoiMjAyMy0wMS0wMVQwMDowMDowMFoifV0=';
      const mockElements = {
        'import-dialog': { showModal: jest.fn(), close: jest.fn() },
        'import-content': { 
          value: encodedData,
          trim: jest.fn().mockReturnValue(encodedData)
        },
        'confirm-import': {
          addEventListener: jest.fn((event, callback) => {
            window.importCallback = callback;
          })
        },
        'importar-btn': {
          addEventListener: jest.fn((event, callback) => {
            window.showImportDialogCallback = callback;
          })
        }
      };
      setupElementMock(mockElements);
      
      // Simulate page init
      require('../patentes.js');
      
      // Show the import dialog
      window.showImportDialogCallback();
      expect(document.getElementById('import-dialog').showModal).toHaveBeenCalled();
      
      // Execute import function
      window.importCallback();
      
      // Check localStorage was updated
      expect(window.localStorage.setItem).toHaveBeenCalledWith('patentes', expect.any(String));
      expect(showInfoDialog).toHaveBeenCalledWith('Éxito', 'Patentes importadas con éxito');
      
      // Clean up globals
      delete window.importCallback;
      delete window.showImportDialogCallback;
    });
    
    test('should show confirmation if existing patentes would be overwritten', () => {
      // Setup mock with existing data
      window.localStorage.getItem.mockReturnValue('[{"patente":"existing"}]');
      
      const encodedData = 'W3sicGF0ZW50ZSI6Im5ldyJ9XQ==';
      const mockElements = {
        'import-dialog': { close: jest.fn() },
        'import-content': { 
          value: encodedData,
          trim: jest.fn().mockReturnValue(encodedData)
        },
        'confirm-import': {
          addEventListener: jest.fn((event, callback) => {
            window.importCallback = callback;
          })
        }
      };
      setupElementMock(mockElements);
      
      // Simulate page init
      require('../patentes.js');
      
      // Execute import with existing data
      window.importCallback();
      
      // Confirm dialog should be shown
      expect(showConfirmDialog).toHaveBeenCalledWith(
        '¡Atención!', 
        expect.any(String), 
        expect.any(Function),
        expect.any(Function)
      );
      
      // Since our mock executes onConfirm, import should complete
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(document.getElementById('import-dialog').close).toHaveBeenCalled();
      
      delete window.importCallback;
    });
  });
});
