/**
 * Creates consistent mocks for patentes module for testing
 */
export function mockPatentesModule() {
  jest.mock('../patentes', () => {
    const original = jest.requireActual('../patentes');
    return {
      ...original,
      initApp: jest.fn(() => {
        // Minimal implementation to setup form handlers
        const form = document.getElementById('form-patente');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const dialog = document.getElementById('patente-detail-dialog');
            if (dialog) dialog.showModal();
          });
        }
      }),
      handleCapturar: jest.fn(() => {
        // Mock implementation that doesn't need geolocation
        const dialog = document.getElementById('patente-detail-dialog');
        if (dialog) dialog.close();
      })
    };
  });
}

/**
 * Sets up the mocks for patentes module
 */
export function setupPatentesModuleMock(initAppImpl) {
  // Get the mocked module
  const patentesModule = require('../patentes');
  
  // Reset any mocks
  jest.resetAllMocks();
  
  // Apply implementation
  patentesModule.initApp.mockImplementation(initAppImpl || (() => {}));
  
  return patentesModule;
}

/**
 * Creates consistent DOM-related mocks for testing
 */
export function setupDomMocks() {
  // Mock classList object
  document.body.classList = {
    add: jest.fn(),
    contains: jest.fn(() => false),
    remove: jest.fn(),
    toggle: jest.fn()
  };
  
  // Mock navigator.geolocation
  global.navigator = {
    geolocation: {
      getCurrentPosition: jest.fn((success) => {
        success({ coords: { latitude: 10, longitude: 20 } });
      })
    }
  };
  
  // Make it accessible via window
  window.navigator = global.navigator;
  
  // Mock HTMLElement.prototype
  HTMLElement.prototype.click = function() {
    const event = new Event('click');
    this.dispatchEvent(event);
  };
  
  return {
    bodyClassList: document.body.classList,
    geolocation: navigator.geolocation
  };
}
