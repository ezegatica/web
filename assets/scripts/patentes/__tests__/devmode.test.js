import { initApp } from '../patentes.js';
import { showInfoDialog } from '../ui.js';

jest.mock('../ui.js', () => ({
  showError: jest.fn(),
  showInfoDialog: jest.fn(),
  showConfirmDialog: jest.fn(),
  setupThemeToggle: jest.fn(),
  showMap: jest.fn(),
}));

describe('Dev Mode Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset global dev mode state
    window.devMode = false;
    
    // Create spy functions for document.body.classList methods
    jest.spyOn(document.body.classList, 'add').mockImplementation(jest.fn());
    jest.spyOn(document.body.classList, 'remove').mockImplementation(jest.fn());
    jest.spyOn(document.body.classList, 'contains').mockImplementation(() => false);
    
    // Mock document.getElementById with proper event handler storage
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'page-title') {
        return {
          addEventListener: jest.fn().mockImplementation((event, handler) => {
            if (event === 'click') {
              document.getElementById.pageTitleClickHandler = handler;
            }
          })
        };
      }
      
      if (id === 'dev-mode-toggle') {
        return {
          addEventListener: jest.fn().mockImplementation((event, handler) => {
            if (event === 'click') {
              document.getElementById.devToggleClickHandler = handler;
            }
          })
        };
      }
      
      // Return a basic mock for other elements
      return {
        addEventListener: jest.fn(),
        style: {},
        innerHTML: '',
        dataset: {},
        close: jest.fn(),
        showModal: jest.fn()
      };
    });
    
    // Mock URLSearchParams
    global.URLSearchParams = jest.fn().mockImplementation(() => ({
      has: jest.fn().mockReturnValue(false),
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn()
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('should add event listeners for dev mode toggle on initialization', () => {
    initApp();
    
    const pageTitle = document.getElementById('page-title');
    const devToggle = document.getElementById('dev-mode-toggle');
    
    expect(pageTitle.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(devToggle.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });
  
  test('should activate dev mode from URL parameter', () => {
    // Mock URL param check to return true for 'dev'
    global.URLSearchParams.mockImplementation(() => ({
      has: jest.fn((key) => key === 'dev' ? true : false),
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn()
    }));
    
    initApp();
    
    expect(document.body.classList.add).toHaveBeenCalledWith('dev-mode');
  });
  
  test('should toggle dev mode after 5 clicks on page title', () => {
    initApp();
    
    // Get the stored page title click handler
    const clickHandler = document.getElementById.pageTitleClickHandler;
    
    // Simulate 5 clicks using the stored handler
    for (let i = 0; i < 5; i++) {
      clickHandler();
    }
    
    // Check that dev mode was enabled
    expect(document.body.classList.add).toHaveBeenCalledWith('dev-mode');
    expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", expect.any(String));
  });
  
  test('should toggle off dev mode when already active', () => {
    // Set initial state to dev mode active
    window.devMode = true;
    
    // Setup contains mock to return true since dev mode is active
    jest.spyOn(document.body.classList, 'contains').mockImplementation(() => true);
    
    initApp();
    
    // Get the dev toggle click handler
    const clickHandler = document.getElementById.devToggleClickHandler;
    
    // Simulate click on the dev toggle button
    clickHandler();
    
    // Check that dev mode was disabled
    expect(document.body.classList.remove).toHaveBeenCalledWith('dev-mode');
    expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", "Modo desarrollador desactivado");
  });
});
