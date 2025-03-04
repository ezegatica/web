import { sanitizeInput, clearResults } from '../patentes.js';
import { showError, showInfoDialog, showConfirmDialog } from '../ui.js';

// Mock the document methods
document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'error') {
    return { innerHTML: 'some error' };
  }
  
  if (id === 'error-dialog' || id === 'error-message') {
    return {
      textContent: '',
      showModal: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      dataset: {}
    };
  }
  
  return {
    style: {},
    addEventListener: jest.fn(),
    textContent: '',
    innerHTML: '',
    close: jest.fn(),
    showModal: jest.fn()
  };
});

document.createElement = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  showModal: jest.fn(),
  close: jest.fn(),
  remove: jest.fn(),
  querySelector: jest.fn().mockReturnValue({
    addEventListener: jest.fn()
  }),
  style: {},
  className: '',
  innerHTML: ''
}));

// Instead of replacing document.body, mock its methods
document.body.appendChild = jest.fn();

// Mock functions that we don't need to test
window.URL = jest.fn(() => ({
  searchParams: {
    delete: jest.fn()
  }
}));

window.history = {
  replaceState: jest.fn()
};

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeInput error handling', () => {
    test('should handle empty input', () => {
      const result = sanitizeInput('');
      
      expect(result.error).toBe(
        'Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra'
      );
    });
    
    test('should handle whitespace input', () => {
      const result = sanitizeInput('   ');
      
      expect(result.error).toBe(
        'Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra'
      );
    });
    
    test('should handle malformed diplomatic plate format', () => {
      const result = sanitizeInput('D12BG');
      
      expect(result.error).toBe(
        'Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra'
      );
    });
    
    test('should handle country code with incorrect length', () => {
      const result = sanitizeInput('BGX');
      
      expect(result.error).toBe(
        'Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra'
      );
    });
    
    test('should handle country code with numbers', () => {
      const result = sanitizeInput('B1');
      
      expect(result.error).toBe(
        'Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra'
      );
    });
  });

  describe('showError', () => {
    test('should show error in static dialog if available', () => {
      showError('Test error message');
      
      expect(document.getElementById).toHaveBeenCalledWith('error-dialog');
      expect(document.getElementById).toHaveBeenCalledWith('error-message');
    });
    
    test('should fallback to dynamic dialog if static not available', () => {
      // Force getElementById to return null for error-dialog
      document.getElementById.mockReturnValueOnce(null);
      document.getElementById.mockReturnValueOnce(null);
      
      showError('Test error message');
      
      expect(document.createElement).toHaveBeenCalledWith('dialog');
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('showInfoDialog', () => {
    test('should create info dialog with title and message', () => {
      showInfoDialog('Test Title', 'Test message');
      
      expect(document.createElement).toHaveBeenCalledWith('dialog');
      expect(document.body.appendChild).toHaveBeenCalled();
    });
    
    test('should attach close handler', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn(),
        remove: jest.fn()
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showInfoDialog('Test', 'Test');
      
      expect(mockDialog.querySelector).toHaveBeenCalledWith('#close-info');
      expect(mockDialog.querySelector().addEventListener).toHaveBeenCalled();
    });
  });

  describe('showConfirmDialog', () => {
    test('should create confirm dialog with confirm and cancel buttons', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      showConfirmDialog('Test Title', 'Test message', onConfirm, onCancel);
      
      expect(document.createElement).toHaveBeenCalledWith('dialog');
      expect(document.body.appendChild).toHaveBeenCalled();
    });
    
    test('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        querySelector: jest.fn().mockImplementation((selector) => {
          if (selector === '#confirm-action') {
            return {
              addEventListener: jest.fn((event, callback) => {
                if (event === 'click') {
                  callback();
                }
              })
            };
          }
          return {
            addEventListener: jest.fn()
          };
        }),
        addEventListener: jest.fn(),
        remove: jest.fn(),
        close: jest.fn()
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showConfirmDialog('Test Title', 'Test message', onConfirm, onCancel);
      
      expect(onConfirm).toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should call onCancel when cancel button is clicked', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        querySelector: jest.fn().mockImplementation((selector) => {
          if (selector === '#cancel-action') {
            return {
              addEventListener: jest.fn((event, callback) => {
                if (event === 'click') {
                  callback();
                }
              })
            };
          }
          return {
            addEventListener: jest.fn()
          };
        }),
        addEventListener: jest.fn(),
        remove: jest.fn(),
        close: jest.fn()
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showConfirmDialog('Test Title', 'Test message', onConfirm, onCancel);
      
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should call onCancel when clicking outside the dialog', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Simulate click on the dialog itself (outside content)
            callback({ target: mockDialog });
          }
        }),
        remove: jest.fn(),
        close: jest.fn()
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showConfirmDialog('Test Title', 'Test message', onConfirm, onCancel);
      
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should not trigger onCancel if dialog is clicked but target is not the dialog itself', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Simulate click inside dialog content (not outside)
            callback({ target: { id: 'some-element-inside-dialog' } });
          }
        }),
        remove: jest.fn(),
        close: jest.fn()
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showConfirmDialog('Test Title', 'Test message', onConfirm, onCancel);
      
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
      expect(mockDialog.close).not.toHaveBeenCalled();
    });
  });
  
  describe('clearResults', () => {
    test('should clear error element if it exists', () => {
      const mockErrorElement = { innerHTML: 'Some error' };
      document.getElementById.mockReturnValueOnce(mockErrorElement);
      
      clearResults();
      
      expect(mockErrorElement.innerHTML).toBe('');
    });
    
    test('should not throw if error element does not exist', () => {
      document.getElementById.mockReturnValueOnce(null);
      
      expect(() => clearResults()).not.toThrow();
    });
  });
});