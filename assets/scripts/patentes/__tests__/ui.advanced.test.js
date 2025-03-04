import { showError, showInfoDialog, showConfirmDialog, showMap } from '../ui.js';

// Mock document methods
document.createElement = jest.fn().mockImplementation((tag) => {
  const element = {
    id: '',
    className: '',
    innerHTML: '',
    style: {},
    addEventListener: jest.fn((event, callback) => {
      // Execute the callback to increase coverage
      if (event === 'click') {
        callback({ target: element });
      } else if (event === 'close') {
        callback();
      }
    }),
    close: jest.fn(),
    showModal: jest.fn(),
    remove: jest.fn(),
    querySelector: jest.fn().mockImplementation((selector) => ({
      addEventListener: jest.fn((event, callback) => callback()),
    })),
    dataset: {},
  };
  return element;
});

// Instead of replacing document.body, mock only the appendChild method
document.body.appendChild = jest.fn();

// Create a mock for getElementById that returns null for error-dialog
const originalGetElementById = document.getElementById;
beforeEach(() => {
  document.getElementById = jest.fn().mockImplementation((id) => {
    if (id === 'error-dialog' || id === 'error-message') {
      return null;
    }
    if (id === 'map-title') {
      // Create a proper mock that you can set and get values from
      return {
        textContent: '',
        set textContent(value) {
          this._textContent = value;
        },
        get textContent() {
          return this._textContent;
        }
      };
    }
    if (id === 'map-dialog') {
      const dialogEl = {
        showModal: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };
      // Correctly implement addEventListener to store the callback
      dialogEl.addEventListener = jest.fn((event, callback) => {
        if (event === 'close') {
          dialogEl.closeEvent = callback;
        }
      });
      return dialogEl;
    }
    if (id === 'map-container') {
      return {
        innerHTML: '',
        appendChild: jest.fn()
      };
    }
    if (id === 'leaflet-map') {
      return { style: {} };
    }
    return {
      id,
      textContent: '',
      innerHTML: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn().mockReturnValue(false),
      },
      style: { display: 'block' },
      close: jest.fn(),
      showModal: jest.fn(),
      querySelector: jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
      })),
      dataset: {},
      addEventListener: jest.fn((event, callback) => {
        if (event === 'click') {
          callback({ target: { id } });
        } else if (event === 'close') {
          callback();
        }
      }),
      querySelectorAll: jest.fn().mockReturnValue([]),
    };
  });
});

afterEach(() => {
  document.getElementById = originalGetElementById;
  jest.clearAllMocks();
});

describe('Advanced UI Functions', () => {
  describe('showError fallback', () => {
    test('should create dynamic error dialog when static one is not found', () => {
      showError('Test error message');
      expect(document.createElement).toHaveBeenCalledWith('dialog');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    test('should attach click handler to close dynamic error dialog', () => {
      const dialog = document.createElement();
      document.createElement.mockReturnValueOnce(dialog);
      
      showError('Test error message');
      
      // The dialog should have event listeners attached
      expect(dialog.addEventListener).toHaveBeenCalled();
    });
    
    test('should close and remove dynamic error dialog when close button is clicked', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn((event, callback) => {
            if (event === 'click') {
              callback();
            }
          })
        }),
        addEventListener: jest.fn()
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showError('Test error message');
      
      expect(mockDialog.close).toHaveBeenCalled();
      expect(mockDialog.remove).toHaveBeenCalled();
    });
    
    test('should close dynamic error dialog when clicked outside', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Simulate click on the dialog itself (outside content)
            callback({ target: mockDialog });
          }
        })
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showError('Test error message');
      
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should not close dynamic error dialog when click is inside dialog content', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Simulate click inside dialog content
            callback({ target: { id: 'inner-element' } });
          }
        })
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showError('Test error message');
      
      expect(mockDialog.close).not.toHaveBeenCalled();
    });
    
    test('should remove dialog on close event', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'close') {
            callback();
          }
        })
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showError('Test error message');
      
      expect(mockDialog.remove).toHaveBeenCalled();
    });
  });

  describe('showInfoDialog', () => {
    test('should create and display info dialog', () => {
      showInfoDialog('Test Title', 'Test message');
      expect(document.createElement).toHaveBeenCalledWith('dialog');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    test('should close dialog on outside click', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Simulate click on the dialog itself
            callback({ target: mockDialog });
          }
        })
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showInfoDialog('Title', 'Message');
      
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should not close dialog when click is inside dialog content', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Simulate click inside dialog content
            callback({ target: { id: 'inner-element' } });
          }
        })
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showInfoDialog('Title', 'Message');
      
      expect(mockDialog.close).not.toHaveBeenCalled();
    });
    
    test('should remove dialog on close event', () => {
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'close') {
            callback();
          }
        })
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showInfoDialog('Title', 'Message');
      
      expect(mockDialog.remove).toHaveBeenCalled();
    });
  });

  describe('showConfirmDialog', () => {
    test('should create and display confirm dialog with cancel callback', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      showConfirmDialog('Test Title', 'Test message', onConfirm, onCancel);
      
      expect(document.createElement).toHaveBeenCalledWith('dialog');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    test('should handle outside click with cancel callback', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn().mockImplementation((selector) => ({
          addEventListener: jest.fn()
        })),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'click') {
            // Simulate click on dialog background
            callback({ target: mockDialog });
          }
        })
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      showConfirmDialog('Test Title', 'Test message', onConfirm, onCancel);
      
      expect(onCancel).toHaveBeenCalled();
      expect(mockDialog.close).toHaveBeenCalled();
    });
    
    test('should handle null onCancel parameter', () => {
      const onConfirm = jest.fn();
      
      const mockDialog = {
        className: '',
        innerHTML: '',
        showModal: jest.fn(),
        close: jest.fn(),
        remove: jest.fn(),
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
          return { addEventListener: jest.fn() };
        }),
        addEventListener: jest.fn()
      };
      
      document.createElement.mockReturnValueOnce(mockDialog);
      
      // Pass null for onCancel
      showConfirmDialog('Test Title', 'Test message', onConfirm, null);
      
      // Should not throw and should close dialog
      expect(mockDialog.close).toHaveBeenCalled();
    });
  });

  describe('showMap', () => {
    beforeEach(() => {
      // Mock Leaflet functions
      global.L = {
        map: jest.fn().mockReturnValue({
          fitBounds: jest.fn(),
          invalidateSize: jest.fn(),
          remove: jest.fn(),
        }),
        latLngBounds: jest.fn().mockReturnValue({
          extend: jest.fn(),
          getSouthWest: jest.fn().mockReturnValue({
            distanceTo: jest.fn().mockReturnValue(2000),
          }),
          getNorthEast: jest.fn(),
        }),
        tileLayer: jest.fn().mockReturnValue({
          addTo: jest.fn(),
        }),
        latLng: jest.fn(),
        marker: jest.fn().mockReturnValue({
          addTo: jest.fn().mockReturnValue({
            bindPopup: jest.fn(),
          }),
        }),
      };

      // Mock setTimeout
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      delete global.L;
    });

    test('should display a map with a single location', () => {
      const locations = [
        { lat: 10, lon: 20, date: '2023-01-01T12:00:00Z' }
      ];
      
      showMap(locations, 'TEST123');
      
      // Check map title content using the textContent property
      const mapTitle = document.getElementById('map-title');
      expect(mapTitle.textContent).toBe('TEST123 - 1 ubicación(es)');
      
      expect(global.L.map).toHaveBeenCalled();
      expect(global.L.tileLayer).toHaveBeenCalled();
      expect(global.L.marker).toHaveBeenCalledWith([10, 20]);
      
      // Trigger setTimeout
      jest.runAllTimers();
    });

    test('should display a map with multiple locations and calculate bounds', () => {
      const locations = [
        { lat: 10, lon: 20, date: '2023-01-01T12:00:00Z' },
        { lat: 11, lon: 21, date: '2023-01-02T12:00:00Z' }
      ];
      
      showMap(locations, 'TEST456');
      
      // Check map title content
      const mapTitle = document.getElementById('map-title');
      expect(mapTitle.textContent).toBe('TEST456 - 2 ubicación(es)');
      
      expect(global.L.map).toHaveBeenCalled();
      expect(global.L.marker).toHaveBeenCalledTimes(2);
      
      // Test bounds calculation
      expect(global.L.latLngBounds().extend).toHaveBeenCalledTimes(2);
      
      // Trigger setTimeout
      jest.runAllTimers();
    });
    
    test('should handle missing date in location', () => {
      const locations = [
        { lat: 10, lon: 20 } // No date
      ];
      
      showMap(locations, 'TEST789');
      
      expect(global.L.marker).toHaveBeenCalledWith([10, 20]);
      // Should default to unknown date in popup
      expect(global.L.marker().addTo().bindPopup).toHaveBeenCalledWith(expect.stringContaining('Fecha desconocida'));
      
      jest.runAllTimers();
    });
    
    test('should clean up map on dialog close', () => {
      const locations = [
        { lat: 10, lon: 20, date: '2023-01-01T12:00:00Z' }
      ];
      
      showMap(locations, 'TEST-CLEANUP');
      
      const mapDialog = document.getElementById('map-dialog');
      
      // Close event listener should be registered
      expect(mapDialog.addEventListener).toHaveBeenCalledWith('close', expect.any(Function));
      
      // Simulate dialog close event using the stored event handler
      mapDialog.closeEvent();
      
      // Map should be removed
      expect(global.L.map().remove).toHaveBeenCalled();
    });
    
    test('should use different zoom levels based on distance between points', () => {
      // Test with very close points (distance < 500m)
      global.L.latLngBounds().getSouthWest().distanceTo.mockReturnValueOnce(300);
      
      const locationsClose = [
        { lat: 10.001, lon: 20.001, date: '2023-01-01T12:00:00Z' },
        { lat: 10.002, lon: 20.002, date: '2023-01-02T12:00:00Z' }
      ];
      
      showMap(locationsClose, 'CLOSE-POINTS');
      
      expect(global.L.map().fitBounds).toHaveBeenCalledWith(expect.anything(), 
        expect.objectContaining({ maxZoom: 16 }));
      
      jest.clearAllMocks();
      
      // Test with very distant points (distance > 10000km)
      global.L.latLngBounds().getSouthWest().distanceTo.mockReturnValueOnce(12000000);
      
      const locationsDistant = [
        { lat: 10, lon: 20, date: '2023-01-01T12:00:00Z' },
        { lat: 50, lon: 60, date: '2023-01-02T12:00:00Z' }
      ];
      
      showMap(locationsDistant, 'DISTANT-POINTS');
      
      expect(global.L.map().fitBounds).toHaveBeenCalledWith(expect.anything(), 
        expect.objectContaining({ maxZoom: 1 }));
    });
  });
});
