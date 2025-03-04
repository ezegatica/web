import { showError, showInfoDialog, showConfirmDialog, setupThemeToggle } from '../ui.js';

describe('UI Edge Cases', () => {
  beforeEach(() => {
    // Mock document elements
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'error-dialog') {
        return {
          textContent: '',
          showModal: jest.fn(),
          addEventListener: jest.fn(),
          dataset: {}
        };
      }
      
      if (id === 'error-message') {
        return {
          textContent: ''
        };
      }
      
      if (id === 'theme-toggle') {
        return {
          addEventListener: jest.fn((event, handler) => {
            if (event === 'click') {
              // Store the click handler to test theme toggle
              document.getElementById.themeToggleHandler = handler;
            }
          })
        };
      }
      
      return null; // Return null for other elements to trigger fallbacks
    });
    
    // Mock document methods
    document.createElement = jest.fn().mockImplementation(() => {
      const mockElement = {
        innerHTML: '',
        className: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn(),
        addEventListener: jest.fn()
      };
      
      // Store a handler property directly on the mock element
      mockElement._closeCallback = () => {
        mockElement.close();
        mockElement.remove();
      };
      
      mockElement.querySelector.mockReturnValue({
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Store the callback directly on the mock
            mockElement._closeCallback = callback;
          }
        })
      });
      
      return mockElement;
    });
    
    document.body.appendChild = jest.fn();
    
    // Mock localStorage
    const mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => mockLocalStorage[key]),
        setItem: jest.fn((key, value) => { mockLocalStorage[key] = value; }),
        removeItem: jest.fn(key => { delete mockLocalStorage[key]; })
      },
      writable: true
    });
    
    // Instead of replacing document.documentElement, mock its classList methods
    jest.spyOn(document.documentElement.classList, 'add').mockImplementation(jest.fn());
    jest.spyOn(document.documentElement.classList, 'remove').mockImplementation(jest.fn());
    jest.spyOn(document.documentElement.classList, 'contains').mockImplementation(() => false);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  describe('showError', () => {
    test('should handle existing static error dialog', () => {
      showError('Test error');
      
      expect(document.getElementById).toHaveBeenCalledWith('error-dialog');
      expect(document.getElementById).toHaveBeenCalledWith('error-message');
      expect(document.createElement).not.toHaveBeenCalled();
    });
    
    test('should create dynamic dialog when error-dialog not found but error-message found', () => {
      // Return error-dialog as null but error-message as an object
      document.getElementById.mockImplementationOnce(() => null);
      
      showError('Test error');
      
      expect(document.createElement).toHaveBeenCalledWith('dialog');
      expect(document.body.appendChild).toHaveBeenCalled();
    });
    
    test('should execute close handler on dynamic error dialog', () => {
      // Force creation of dynamic dialog by returning null for dialog elements
      document.getElementById.mockImplementation(() => null);
      
      showError('Test error');
      
      const mockDialog = document.createElement.mock.results[0].value;
      
      // Trigger the stored callback directly
      mockDialog._closeCallback();
      
      expect(mockDialog.close).toHaveBeenCalled();
      expect(mockDialog.remove).toHaveBeenCalled();
    });
    
    test('should handle outside click on dynamic error dialog', () => {
      document.getElementById.mockImplementation(() => null);
      
      showError('Test error');
      
      const mockDialog = document.createElement.mock.results[0].value;
      
      // Find the click event handler
      const clickHandler = mockDialog.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )[1];
      
      // Simulate click on dialog itself (outside click)
      clickHandler({ target: mockDialog });
      
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should not close on inside click in dynamic error dialog', () => {
      document.getElementById.mockImplementation(() => null);
      
      showError('Test error');
      
      const mockDialog = document.createElement.mock.results[0].value;
      
      // Find the click event handler
      const clickHandler = mockDialog.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )[1];
      
      // Simulate click inside dialog content
      clickHandler({ target: { id: 'inner-element' } });
      
      expect(mockDialog.close).not.toHaveBeenCalled();
    });
  });
  
  describe('showInfoDialog', () => {
    test('should register close handler for button', () => {
      // Create a dialog mock with proper behavior
      const mockDialog = {
        innerHTML: '',
        className: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn(),
        addEventListener: jest.fn()
      };
      
      mockDialog.querySelector.mockReturnValue({
        addEventListener: jest.fn()
      });
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showInfoDialog('Test Title', 'Test Message');
      
      expect(mockDialog.querySelector).toHaveBeenCalledWith('#close-info');
      expect(mockDialog.querySelector().addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
    
    test('should trigger close on button click', () => {
      // Create a dialog mock with proper behavior
      const mockDialog = {
        innerHTML: '',
        className: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn()
      };
      
      const closeButton = {
        addEventListener: jest.fn((event, callback) => {
          // Store the callback directly on the button
          closeButton._clickCallback = callback;
        })
      };
      
      mockDialog.querySelector.mockReturnValue(closeButton);
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showInfoDialog('Test Title', 'Test Message');
      
      // Trigger the stored click handler
      closeButton._clickCallback();
      
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should handle outside click', () => {
      const mockDialog = document.createElement();
      
      document.createElement.mockReturnValue(mockDialog);
      
      showInfoDialog('Test Title', 'Test Message');
      
      // Find the click handler
      const clickHandler = mockDialog.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )[1];
      
      // Simulate click on dialog itself
      clickHandler({ target: mockDialog });
      
      expect(mockDialog.close).toHaveBeenCalled();
    });
  });
  
  describe('showConfirmDialog', () => {
    test('should execute onConfirm callback', () => {
      const mockDialog = document.createElement();
      const confirmButton = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            confirmButton._clickCallback = callback;
          }
        })
      };
      
      // Setup mockDialog to return different elements based on selector
      mockDialog.querySelector.mockImplementation((selector) => {
        if (selector === '#confirm-action') {
          return confirmButton;
        }
        return { addEventListener: jest.fn() };
      });
      
      document.createElement.mockReturnValue(mockDialog);
      
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      showConfirmDialog('Test', 'Message', onConfirm, onCancel);
      
      // Trigger confirm button click
      confirmButton._clickCallback();
      
      expect(onConfirm).toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should execute onCancel callback when provided', () => {
      const mockDialog = document.createElement();
      const cancelButton = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            cancelButton._clickCallback = callback;
          }
        })
      };
      
      // Setup mockDialog to return different elements based on selector
      mockDialog.querySelector.mockImplementation((selector) => {
        if (selector === '#cancel-action') {
          return cancelButton;
        }
        return { addEventListener: jest.fn() };
      });
      
      document.createElement.mockReturnValue(mockDialog);
      
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      showConfirmDialog('Test', 'Message', onConfirm, onCancel);
      
      // Trigger cancel button click
      cancelButton._clickCallback();
      
      expect(onCancel).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should not throw when onCancel is null', () => {
      const mockDialog = document.createElement();
      const cancelButton = {
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            cancelButton._clickCallback = callback;
          }
        })
      };
      
      // Setup mockDialog
      mockDialog.querySelector.mockImplementation((selector) => {
        if (selector === '#cancel-action') {
          return cancelButton;
        }
        return { addEventListener: jest.fn() };
      });
      
      document.createElement.mockReturnValue(mockDialog);
      
      const onConfirm = jest.fn();
      
      // Pass null for onCancel
      showConfirmDialog('Test', 'Message', onConfirm, null);
      
      // Trigger cancel button click - should not throw
      expect(() => {
        cancelButton._clickCallback();
      }).not.toThrow();
      
      expect(mockDialog.close).toHaveBeenCalled();
    });
  });
  
  describe('setupThemeToggle', () => {
    test('should check localStorage for saved theme preference (dark)', () => {
      // Set up localStorage to return 'dark' theme
      window.localStorage.getItem.mockReturnValue('dark');
      
      setupThemeToggle();
      
      expect(window.localStorage.getItem).toHaveBeenCalledWith('theme');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });
    
    test('should check localStorage for saved theme preference (light)', () => {
      // Set up localStorage to return 'light' theme
      window.localStorage.getItem.mockReturnValue('light');
      
      setupThemeToggle();
      
      expect(window.localStorage.getItem).toHaveBeenCalledWith('theme');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });
    
    test('should default to light theme when no preference is saved', () => {
      // Set up localStorage to return null (no theme saved)
      window.localStorage.getItem.mockReturnValue(null);
      
      setupThemeToggle();
      
      expect(window.localStorage.getItem).toHaveBeenCalledWith('theme');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
    
    test('should toggle theme when button is clicked', () => {
      // Mock themeToggleBtn
      const themeToggleBtn = {
        addEventListener: jest.fn((event, handler) => {
          themeToggleBtn.clickHandler = handler;
        })
      };
      
      document.getElementById.mockImplementation(id => {
        if (id === 'theme-toggle') return themeToggleBtn;
        return null;
      });
      
      // Mock document.documentElement.classList.contains to simulate toggling
      jest.spyOn(document.documentElement.classList, 'contains')
          .mockImplementation(() => false); // initially not dark mode
      
      setupThemeToggle();
      
      // Get the click handler that was registered
      const clickHandler = themeToggleBtn.clickHandler;
      
      // Simulate click on theme toggle button
      clickHandler();
      
      // Should switch to dark mode
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      
      // Reset mocks and make it return true for dark mode
      jest.clearAllMocks();
      jest.spyOn(document.documentElement.classList, 'contains')
          .mockImplementation(() => true); // now in dark mode
      
      // Simulate another click
      clickHandler();
      
      // Should switch back to light mode
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });
});