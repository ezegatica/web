/**
 * Shared test utilities for all test files
 */

// Setup common DOM mocks
export function setupDomMocks() {
  // Mock document.body methods
  document.body.appendChild = jest.fn();
  document.body.classList = {
    add: jest.spyOn(document.body.classList, 'add').mockImplementation(jest.fn()),
    remove: jest.spyOn(document.body.classList, 'remove').mockImplementation(jest.fn()),
    contains: jest.spyOn(document.body.classList, 'contains').mockImplementation(() => false)
  };

  // Mock document.documentElement methods
  jest.spyOn(document.documentElement.classList, 'add').mockImplementation(jest.fn());
  jest.spyOn(document.documentElement.classList, 'remove').mockImplementation(jest.fn());
  jest.spyOn(document.documentElement.classList, 'contains').mockImplementation(() => false);

  // Mock createElement
  document.createElement = jest.fn().mockImplementation(() => {
    const element = {
      id: '',
      className: '',
      innerHTML: '',
      style: {},
      addEventListener: jest.fn(),
      close: jest.fn(),
      showModal: jest.fn(),
      remove: jest.fn(),
      querySelector: jest.fn().mockReturnValue({
        addEventListener: jest.fn()
      }),
      dataset: {},
    };
    return element;
  });

  document.execCommand = jest.fn();
}

// Setup storage mocks (localStorage, URLSearchParams)
export function setupStorageMocks() {
  // Mock localStorage
  const mockStorage = {};
  const localStorageMock = {
    getItem: jest.fn(key => mockStorage[key] || null),
    setItem: jest.fn((key, value) => { mockStorage[key] = value; }),
    removeItem: jest.fn(key => { delete mockStorage[key]; }),
    clear: jest.fn(() => Object.keys(mockStorage).forEach(key => delete mockStorage[key])),
    _data: mockStorage // For test access
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
  
  // Mock URL and URLSearchParams
  const mockUrl = new URL('https://example.com');
  const mockSearchParams = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn().mockReturnValue(false)
  };
  Object.defineProperty(mockUrl, 'searchParams', { get: () => mockSearchParams });
  window.URL = jest.fn(() => mockUrl);
  window.history = { replaceState: jest.fn() };

  global.URLSearchParams = jest.fn().mockImplementation(() => ({
    has: jest.fn().mockReturnValue(false),
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }));

  return { mockStorage, mockSearchParams, localStorageMock };
}

// Mock Leaflet map library
export function setupMapMocks() {
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
    tileLayer: jest.fn().mockReturnValue({ addTo: jest.fn() }),
    latLng: jest.fn(),
    marker: jest.fn().mockReturnValue({
      addTo: jest.fn().mockReturnValue({ bindPopup: jest.fn() }),
    }),
  };
}

// Setup getElementById mock with customizable elements
export function setupElementMock(customElements = {}) {
  document.getElementById = jest.fn().mockImplementation((id) => {
    // Return custom mock if provided
    if (id in customElements) {
      return customElements[id];
    }

    // Map dialog elements
    if (id === 'map-title') {
      return {
        textContent: '',
        set textContent(value) { this._textContent = value; },
        get textContent() { return this._textContent; }
      };
    }
    if (id === 'map-dialog') {
      const dialogEl = {
        showModal: jest.fn(),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'close') dialogEl.closeEvent = callback;
        }),
        removeEventListener: jest.fn(),
        close: jest.fn()
      };
      return dialogEl;
    }
    if (id === 'map-container') {
      return { innerHTML: '', appendChild: jest.fn() };
    }
    if (id === 'leaflet-map') {
      return { style: {} };
    }

    // Error dialog elements
    if (id === 'error-dialog') {
      return {
        textContent: '',
        showModal: jest.fn(),
        addEventListener: jest.fn(),
        dataset: {}
      };
    }
    if (id === 'error-message') {
      return { textContent: '' };
    }
    if (id === 'error') {
      return { innerHTML: 'some error' };
    }

    // Theme toggle
    if (id === 'theme-toggle') {
      return {
        addEventListener: jest.fn((event, handler) => {
          if (event === 'click') {
            document.getElementById.themeToggleHandler = handler;
          }
        })
      };
    }

    // Dev mode elements
    if (id === 'page-title') {
      return {
        addEventListener: jest.fn((event, handler) => {
          if (event === 'click') {
            document.getElementById.pageTitleClickHandler = handler;
          }
        })
      };
    }
    if (id === 'dev-mode-toggle') {
      return {
        addEventListener: jest.fn((event, handler) => {
          if (event === 'click') {
            document.getElementById.devToggleClickHandler = handler;
          }
        })
      };
    }

    // Detail dialog elements
    if (id === 'patente-detail-dialog') {
      return { close: jest.fn(), showModal: jest.fn() };
    }
    if (id === 'patente') {
      return { value: 'D001BGA' };
    }
    if (id === 'codigo-dialog' || id === 'categoria-dialog' || 
        id === 'categoria-traduccion-dialog' || id === 'uso-jefe-dialog') {
      return { innerHTML: '' };
    }
    if (id === 'categoria-container' || id === 'decomposition-container') {
      return { style: { display: 'block' } };
    }
    if (id === 'capturar') {
      return { style: { display: 'none' } };
    }
    if (id === 'patente-visual' || id === 'traduccion-dialog') {
      return { innerHTML: '' };
    }

    // Import/Export elements
    if (id === 'export-dialog' || id === 'import-dialog') {
      return { showModal: jest.fn(), close: jest.fn() };
    }
    if (id === 'export-content') {
      return { value: '', select: jest.fn() };
    }
    if (id === 'import-content') {
      return { 
        value: 'W3sicGF0ZW50ZSI6IkQwMDFCR0EiLCJsYXQiOjEwLCJsb24iOjIwLCJkYXRlIjoiMjAyMy0wMS0wMVQwMDowMDowMFoifV0=',
        trim: () => 'W3sicGF0ZW50ZSI6IkQwMDFCR0EiLCJsYXQiOjEwLCJsb24iOjIwLCJkYXRlIjoiMjAyMy0wMS0wMVQwMDowMDowMFoifV0='
      };
    }

    // Default mock
    return {
      addEventListener: jest.fn(),
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      dataset: {},
      close: jest.fn(),
      showModal: jest.fn()
    };
  });
}

// Mock geolocation API
export function setupGeolocationMock(success = true, latitude = 10, longitude = 20) {
  global.navigator.geolocation = {
    getCurrentPosition: jest.fn().mockImplementation((successCallback, errorCallback) => {
      if (success) {
        successCallback({ coords: { latitude, longitude } });
      } else {
        errorCallback({ code: 1 }); // Permission denied
      }
    })
  };
}

// Mock UI module functions
export function mockUiModule() {
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
}
