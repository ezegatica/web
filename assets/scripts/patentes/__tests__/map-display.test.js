import { showMap } from '../ui.js';

describe('Map Functionality', () => {
  beforeEach(() => {
    // Mock Leaflet
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

    // Mock DOM elements with proper implementation
    document.getElementById = jest.fn().mockImplementation((id) => {
      switch (id) {
        case 'map-dialog':
          return {
            showModal: jest.fn(),
            addEventListener: jest.fn((event, callback) => {
              // Store the callback to simulate dialog close later
              if (event === 'close') {
                document.getElementById.closeHandler = callback;
              }
            }),
            removeEventListener: jest.fn(),
          };
        case 'map-container':
          return {
            innerHTML: '',
            appendChild: jest.fn(),
          };
        case 'map-title':
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
        case 'leaflet-map':
          return { style: {} };
        default:
          return null;
      }
    });

    // Mock createElement for the map container
    document.createElement = jest.fn().mockReturnValue({
      id: '',
      style: {},
    });

    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    delete global.L;
    delete document.getElementById.closeHandler;
  });

  test('should display a map with a single location', () => {
    const locations = [
      { lat: 10, lon: 20, date: '2023-01-01T12:00:00Z' }
    ];

    showMap(locations, 'TEST123');

    // Check map title
    const mapTitle = document.getElementById('map-title');
    expect(mapTitle.textContent).toBe('TEST123 - 1 ubicación(es)');

    // Check that Leaflet map was created
    expect(global.L.map).toHaveBeenCalled();
    expect(global.L.tileLayer).toHaveBeenCalled();
    expect(global.L.marker).toHaveBeenCalledWith([10, 20]);

    // Run the timeout for invalidateSize
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

    // Check marker creation
    expect(global.L.marker).toHaveBeenCalledTimes(2);
    expect(global.L.marker).toHaveBeenNthCalledWith(1, [10, 20]);
    expect(global.L.marker).toHaveBeenNthCalledWith(2, [11, 21]);

    // Check bounds extension
    expect(global.L.latLngBounds().extend).toHaveBeenCalledTimes(2);

    // Run the timeout for invalidateSize
    jest.runAllTimers();
  });

  test('should format dates properly in popups', () => {
    const locations = [
      { lat: 10, lon: 20, date: '2023-01-01T12:00:00Z' }
    ];

    showMap(locations, 'TEST-DATE');

    // Check popup binding
    expect(global.L.marker().addTo().bindPopup).toHaveBeenCalledWith(
      expect.stringContaining('Capturado:')
    );
  });

  test('should handle missing dates in locations', () => {
    const locations = [
      { lat: 10, lon: 20 } // No date
    ];

    showMap(locations, 'TEST-NO-DATE');

    // Should use "Fecha desconocida" in popup
    expect(global.L.marker().addTo().bindPopup).toHaveBeenCalledWith(
      expect.stringContaining('Fecha desconocida')
    );
  });

  test('should clean up map when dialog closes', () => {
    const locations = [{ lat: 10, lon: 20 }];
    
    // Create a mock dialog with correct event handler setup
    const mockDialogElement = {
      showModal: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Make addEventListener actually store the callback
    mockDialogElement.addEventListener = jest.fn((event, callback) => {
      if (event === 'close') {
        mockDialogElement.closeEvent = callback;
      }
    });

    // Update our getElementById mock to return our properly structured mock dialog
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn(id => {
      if (id === 'map-dialog') return mockDialogElement;
      return originalGetElementById(id);
    });

    showMap(locations, 'TEST-CLEANUP');
    
    // Verify addEventListener was called with 'close'
    expect(mockDialogElement.addEventListener).toHaveBeenCalledWith('close', expect.any(Function));
    
    // Simulate dialog close using the stored event handler
    mockDialogElement.closeEvent();
    
    // Check that map was removed
    expect(global.L.map().remove).toHaveBeenCalled();
  });

  test('should adjust max zoom based on distance between points', () => {
    // Test with very close points
    global.L.latLngBounds().getSouthWest().distanceTo.mockReturnValueOnce(300);
    
    const locationsClose = [
      { lat: 10.001, lon: 20.001 },
      { lat: 10.002, lon: 20.002 }
    ];
    
    showMap(locationsClose, 'CLOSE-POINTS');
    
    expect(global.L.map().fitBounds).toHaveBeenCalledWith(
      expect.anything(), 
      expect.objectContaining({ maxZoom: 16 })
    );
    
    // Clear mocks for the next test
    jest.clearAllMocks();
    
    // Test with very distant points
    global.L.latLngBounds().getSouthWest().distanceTo.mockReturnValueOnce(12000000);
    
    const locationsDistant = [
      { lat: 10, lon: 20 },
      { lat: 50, lon: 60 }
    ];
    
    showMap(locationsDistant, 'DISTANT-POINTS');
    
    expect(global.L.map().fitBounds).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ maxZoom: 1 })
    );
  });
});
