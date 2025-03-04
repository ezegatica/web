/**
 * Setup common mocks for testing
 */
export function setupTestMocks() {
  // Mock navigator.geolocation
  Object.defineProperty(global, 'navigator', {
    value: {
      geolocation: {
        getCurrentPosition: jest.fn((success) => {
          success({ coords: { latitude: 10, longitude: 20 } });
        })
      }
    },
    writable: true,
    configurable: true
  });
  
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
      removeItem: jest.fn(key => { delete store[key]; }),
      clear: jest.fn(() => { store = {}; })
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
  // Mock document.documentElement.classList
  const mockClassList = {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(() => false)
  };
  
  Object.defineProperty(document.documentElement, 'classList', {
    get: () => mockClassList,
    configurable: true
  });
  
  // Fix Event class
  global.Event = class Event {
    constructor(type) {
      this.type = type;
      this.preventDefault = jest.fn();
      this.stopPropagation = jest.fn();
    }
  };
  
  // Enhance HTMLElement.prototype for better event handling
  HTMLElement.prototype.__listeners = {};
  HTMLElement.prototype.addEventListener = function(type, listener) {
    this.__listeners[type] = this.__listeners[type] || [];
    this.__listeners[type].push(listener);
  };
  
  HTMLElement.prototype.dispatchEvent = function(event) {
    if (this.__listeners[event.type]) {
      this.__listeners[event.type].forEach(listener => listener.call(this, event));
    }
    if (this[`on${event.type}`]) {
      this[`on${event.type}`].call(this, event);
    }
    return true;
  };
  
  // Add missing DOM methods
  HTMLTextAreaElement.prototype.select = jest.fn();
  HTMLTextAreaElement.prototype.focus = jest.fn();
  
  return {
    localStorage: localStorageMock,
    classList: mockClassList
  };
}

// Add a dummy test to satisfy Jest
describe('test-utils', () => {
  test('should export setupTestMocks function', () => {
    expect(typeof setupTestMocks).toBe('function');
  });
});
