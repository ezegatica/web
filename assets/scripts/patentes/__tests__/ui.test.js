/**
 * Comprehensive UI tests covering dialogs, error handling, maps, and theme
 */
import { showError, showInfoDialog, showConfirmDialog, showMap, setupThemeToggle } from '../ui.js';
import { setupDomMocks, setupStorageMocks, setupMapMocks, setupElementMock } from './test-utils.js';

describe('UI Components', () => {
  beforeEach(() => {
    setupDomMocks();
    setupStorageMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Error Handling', () => {
    test('should use static error dialog when available', () => {
      const customElements = {
        'error-dialog': { textContent: '', showModal: jest.fn() },
        'error-message': { textContent: '' }
      };
      setupElementMock(customElements);
      
      showError('Test error message');
      
      expect(document.getElementById).toHaveBeenCalledWith('error-dialog');
      expect(document.getElementById('error-dialog').showModal).toHaveBeenCalled();
      expect(document.createElement).not.toHaveBeenCalled();
    });

    test('should create dynamic dialog when static one is not found', () => {
      setupElementMock({
        'error-dialog': null,
        'error-message': null
      });
      
      showError('Test error message');
      
      expect(document.createElement).toHaveBeenCalledWith('dialog');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    test('should handle clicks on dynamic error dialog', () => {
      setupElementMock({ 'error-dialog': null });
      
      const mockDialog = {
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn((event, callback) => {
            if (event === 'click') callback();
          })
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Store for testing both inside and outside clicks
            mockDialog.clickHandler = callback;
          }
        })
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showError('Test error');
      
      // Test inside click (should not close)
      mockDialog.clickHandler({ target: { id: 'something-inside' } });
      expect(mockDialog.close).not.toHaveBeenCalled();
      
      // Test outside click (on dialog itself - should close)
      mockDialog.clickHandler({ target: mockDialog });
      expect(mockDialog.close).toHaveBeenCalled();
    });
  });

  describe('Info Dialog', () => {
    test('should create dialog with proper structure', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn((event, callback) => callback())
        }),
        addEventListener: jest.fn(),
        remove: jest.fn()
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showInfoDialog('Test Title', 'Test Message');
      
      expect(mockDialog.innerHTML).toContain('Test Title');
      expect(mockDialog.innerHTML).toContain('Test Message');
      expect(mockDialog.showModal).toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled(); // Should be triggered by our test callback
    });
    
    test('should handle outside click on info dialog', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn(),
        remove: jest.fn()
      };
      
      // Store the click handler for testing
      mockDialog.addEventListener.mockImplementation((event, callback) => {
        if (event === 'click') mockDialog.clickHandler = callback;
      });
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showInfoDialog('Test', 'Test');
      
      // Test outside click
      mockDialog.clickHandler({ target: mockDialog });
      expect(mockDialog.close).toHaveBeenCalled();
      
      // Reset for inside click test
      jest.clearAllMocks();
      mockDialog.clickHandler({ target: { id: 'inside-element' } });
      expect(mockDialog.close).not.toHaveBeenCalled();
    });
  });

  describe('Confirm Dialog', () => {
    test('should handle confirm and cancel actions', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn(),
        addEventListener: jest.fn()
      };
      
      // Setup query selectors for buttons
      mockDialog.querySelector.mockImplementation((selector) => {
        if (selector === '#confirm-action') {
          return {
            addEventListener: jest.fn((event, callback) => {
              if (event === 'click') mockDialog.confirmCallback = callback;
            })
          };
        }
        if (selector === '#cancel-action') {
          return {
            addEventListener: jest.fn((event, callback) => {
              if (event === 'click') mockDialog.cancelCallback = callback;
            })
          };
        }
        return { addEventListener: jest.fn() };
      });
      
      // Setup click handler for outside clicks
      mockDialog.addEventListener.mockImplementation((event, callback) => {
        if (event === 'click') mockDialog.clickHandler = callback;
      });
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showConfirmDialog('Test Title', 'Test message', onConfirm, onCancel);
      
      // Test confirm button
      mockDialog.confirmCallback();
      expect(onConfirm).toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
      
      // Reset for cancel button test
      jest.clearAllMocks();
      mockDialog.cancelCallback();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
      
      // Test outside click (should trigger cancel)
      jest.clearAllMocks();
      mockDialog.clickHandler({ target: mockDialog });
      expect(onCancel).toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
      
      // Test inside click (should not trigger either)
      jest.clearAllMocks();
      mockDialog.clickHandler({ target: { id: 'inside-content' } });
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
      expect(mockDialog.close).not.toHaveBeenCalled();
    });
    
    test('should handle null onCancel callback', () => {
      const onConfirm = jest.fn();
      const mockDialog = document.createElement();
      
      // Add mock cancel button
      mockDialog.querySelector.mockImplementation(selector => {
        if (selector === '#cancel-action') {
          return {
            addEventListener: jest.fn((event, callback) => {
              if (event === 'click') mockDialog.cancelHandler = callback;
            })
          };
        }
        return { addEventListener: jest.fn() };
      });
      
      // Setup click handler for dialog
      mockDialog.addEventListener.mockImplementation((event, callback) => {
        if (event === 'click') mockDialog.clickHandler = callback;
      });
      
      document.createElement.mockReturnValue(mockDialog);
      
      // Call with null onCancel
      showConfirmDialog('Test', 'Test', onConfirm, null);
      
      // Should not throw when cancel is triggered
      expect(() => {
        mockDialog.cancelHandler();
      }).not.toThrow();
      
      expect(mockDialog.close).toHaveBeenCalled();
      
      // Should not throw on outside click
      jest.clearAllMocks();
      expect(() => {
        mockDialog.clickHandler({ target: mockDialog });
      }).not.toThrow();
    });
  });

  describe('Map Display', () => {
    beforeEach(() => {
      setupMapMocks();
    });
    
    afterEach(() => {
      delete global.L;
    });

    test('should display map with correct markers and title', () => {
      setupElementMock();
      
      const locations = [
        { lat: 10, lon: 20, date: '2023-01-01T12:00:00Z' },
        { lat: 11, lon: 21, date: '2023-01-02T12:00:00Z' }
      ];
      
      showMap(locations, 'TEST123');
      
      // Check title and markers
      const mapTitle = document.getElementById('map-title');
      expect(mapTitle.textContent).toBe('TEST123 - 2 ubicación(es)');
      
      expect(global.L.marker).toHaveBeenCalledTimes(2);
      expect(global.L.marker).toHaveBeenNthCalledWith(1, [10, 20]);
      expect(global.L.marker).toHaveBeenNthCalledWith(2, [11, 21]);
      
      // Check map initialization
      expect(global.L.map).toHaveBeenCalled();
      expect(global.L.tileLayer).toHaveBeenCalled();
      expect(global.L.latLngBounds().extend).toHaveBeenCalledTimes(2);
      
      // Run timeout for invalidateSize
      jest.runAllTimers();
    });

    test('should format date and handle missing date in popups', () => {
      const withDate = { lat: 10, lon: 20, date: '2023-01-01T12:00:00Z' };
      const withoutDate = { lat: 11, lon: 21 };
      
      showMap([withDate], 'TEST-DATE');
      expect(global.L.marker().addTo().bindPopup).toHaveBeenCalledWith(
        expect.stringContaining('Capturado:')
      );
      
      jest.clearAllMocks();
      
      showMap([withoutDate], 'TEST-NO-DATE');
      expect(global.L.marker().addTo().bindPopup).toHaveBeenCalledWith(
        expect.stringContaining('Fecha desconocida')
      );
    });

    test('should clean up map when dialog closes', () => {
      const mapDialog = {
        showModal: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        closeEvent: null
      };
      
      mapDialog.addEventListener.mockImplementation((event, callback) => {
        if (event === 'close') mapDialog.closeEvent = callback;
      });
      
      setupElementMock({ 'map-dialog': mapDialog });
      
      showMap([{ lat: 10, lon: 20 }], 'TEST-CLEANUP');
      
      expect(mapDialog.addEventListener).toHaveBeenCalledWith('close', expect.any(Function));
      
      // Simulate dialog close
      mapDialog.closeEvent();
      
      expect(global.L.map().remove).toHaveBeenCalled();
    });

    test('should adjust zoom based on distance between points', () => {
      // Close points get higher zoom
      global.L.latLngBounds().getSouthWest().distanceTo.mockReturnValueOnce(300);
      showMap([
        { lat: 10.001, lon: 20.001 },
        { lat: 10.002, lon: 20.002 }
      ], 'CLOSE');
      
      expect(global.L.map().fitBounds).toHaveBeenCalledWith(
        expect.anything(), expect.objectContaining({ maxZoom: 16 })
      );
      
      // Distant points get lower zoom
      jest.clearAllMocks();
      global.L.latLngBounds().getSouthWest().distanceTo.mockReturnValueOnce(12000000);
      
      showMap([
        { lat: 10, lon: 20 },
        { lat: 50, lon: 60 }
      ], 'DISTANT');
      
      expect(global.L.map().fitBounds).toHaveBeenCalledWith(
        expect.anything(), expect.objectContaining({ maxZoom: 1 })
      );
    });
  });

  describe('Theme Toggle', () => {
    test('should initialize theme from localStorage preference', () => {
      // Test dark theme
      window.localStorage.getItem.mockReturnValueOnce('dark');
      setupThemeToggle();
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      
      // Test light theme
      jest.clearAllMocks();
      window.localStorage.getItem.mockReturnValueOnce('light');
      setupThemeToggle();
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
      
      // Test default (no saved theme)
      jest.clearAllMocks();
      window.localStorage.getItem.mockReturnValueOnce(null);
      setupThemeToggle();
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    test('should toggle between light and dark themes on button click', () => {
      const themeToggleBtn = {
        addEventListener: jest.fn((event, handler) => {
          if (event === 'click') themeToggleBtn.clickHandler = handler;
        })
      };
      
      setupElementMock({ 'theme-toggle': themeToggleBtn });
      
      // Mock initial state as light theme
      document.documentElement.classList.contains.mockReturnValue(false); 
      
      setupThemeToggle();
      
      // Toggle to dark theme
      themeToggleBtn.clickHandler();
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      
      // Reset and toggle to light theme
      jest.clearAllMocks();
      document.documentElement.classList.contains.mockReturnValue(true); 
      themeToggleBtn.clickHandler();
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });
});
