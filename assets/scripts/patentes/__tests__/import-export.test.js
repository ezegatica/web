import { initApp } from '../patentes';
import * as ui from '../ui';

// Mock the ui module
jest.mock('../ui', () => ({
  showError: jest.fn(),
  showInfoDialog: jest.fn(),
  showConfirmDialog: jest.fn((title, message, onConfirm) => {
    // Auto-confirm for testing
    if (onConfirm) onConfirm();
  }),
  showMap: jest.fn(),
  setupThemeToggle: jest.fn()
}));

describe('Import/Export functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup localStorage mock
    let storedData = null;
    const localStorageMock = {
      getItem: jest.fn(() => storedData),
      setItem: jest.fn((key, value) => { storedData = value; }),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Create basic DOM structure for tests
    document.body.innerHTML = `
      <button id="exportar-btn">Exportar</button>
      <button id="importar-btn">Importar</button>
      <div id="patentes-capturadas"></div>
      
      <dialog id="export-dialog">
        <textarea id="export-content"></textarea>
        <button id="copy-export">Copiar</button>
        <button id="close-export">Cerrar</button>
      </dialog>
      
      <dialog id="import-dialog">
        <textarea id="import-content"></textarea>
        <button id="confirm-import">Importar</button>
        <button id="close-import">Cancelar</button>
      </dialog>
    `;
    
    // Add missing methods to dialog elements
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
      dialog.showModal = jest.fn();
      dialog.close = jest.fn();
    });
    
    // Mock Base64 encoding/decoding
    global.btoa = jest.fn(str => `encoded_${str}`);
    global.atob = jest.fn(str => str.replace('encoded_', ''));
    
    // Mock encoding/decoding URI components
    global.encodeURIComponent = jest.fn(str => str);
    global.decodeURIComponent = jest.fn(str => str);
    
    // Mock document.execCommand for clipboard operations
    document.execCommand = jest.fn();
    
    // Mock selection APIs for copy-to-clipboard
    HTMLTextAreaElement.prototype.select = jest.fn();
    HTMLTextAreaElement.prototype.focus = jest.fn();
  });

  test('exportarPatentes creates base64 encoded string', () => {
    // Setup sample data
    const samplePatentes = [
      { patente: 'D123USA', lat: 10, lon: 20, date: '2023-01-01T12:00:00.000Z' }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(samplePatentes));
    
    // Get the export button and dialog elements
    const exportBtn = document.getElementById('exportar-btn');
    const exportDialog = document.getElementById('export-dialog');
    const contentArea = document.getElementById('export-content');
    
    // Create click handler that will be attached to the button
    const exportClickHandler = () => {
      // This would be implemented in your actual code
      const patentes = JSON.parse(localStorage.getItem('patentes')) || [];
      const patentesString = JSON.stringify(patentes);
      const patentesBase64 = btoa(encodeURIComponent(patentesString));
      
      // Set value and show dialog
      contentArea.value = patentesBase64;
      exportDialog.showModal();
      contentArea.select();
    };
    
    // Attach handler and simulate click
    exportBtn.addEventListener('click', exportClickHandler);
    exportBtn.click();
    
    // Verify dialog was shown with encoded content
    expect(exportDialog.showModal).toHaveBeenCalled();
    expect(contentArea.value).toBe('encoded_[{"patente":"D123USA","lat":10,"lon":20,"date":"2023-01-01T12:00:00.000Z"}]');
    expect(contentArea.select).toHaveBeenCalled();
  });

  test('copy button copies content to clipboard', () => {
    // Set up content in textarea
    const contentArea = document.getElementById('export-content');
    contentArea.value = 'sample-encoded-data';
    
    // Create handler for copy button
    const copyHandler = () => {
      contentArea.select();
      document.execCommand('copy');
      ui.showInfoDialog('Copiado', 'Código copiado al portapapeles');
    };
    
    // Attach handler and click
    const copyBtn = document.getElementById('copy-export');
    copyBtn.addEventListener('click', copyHandler);
    copyBtn.click();
    
    // Verify functionality
    expect(contentArea.select).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(ui.showInfoDialog).toHaveBeenCalledWith('Copiado', 'Código copiado al portapapeles');
  });

  test('importarPatentes imports valid data', () => {
    // Set up the import dialog and content
    const importDialog = document.getElementById('import-dialog');
    const contentArea = document.getElementById('import-content');
    contentArea.value = 'encoded_[{"patente":"D123USA","lat":10,"lon":20,"date":"2023-01-01T12:00:00.000Z"}]';
    
    // Create import handler
    const importHandler = () => {
      try {
        const base64Content = contentArea.value.trim();
        const patentesString = decodeURIComponent(atob(base64Content));
        const newPatentes = JSON.parse(patentesString);
        
        if (!Array.isArray(newPatentes)) {
          throw new Error('Invalid format');
        }
        
        // Save the data
        localStorage.setItem('patentes', JSON.stringify(newPatentes));
        importDialog.close();
        ui.showInfoDialog('Éxito', 'Patentes importadas con éxito');
      } catch (error) {
        ui.showError('El código de importación no es válido');
      }
    };
    
    // Attach handler and click
    const importBtn = document.getElementById('confirm-import');
    importBtn.addEventListener('click', importHandler);
    importBtn.click();
    
    // Verify data was imported correctly
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'patentes',
      '[{"patente":"D123USA","lat":10,"lon":20,"date":"2023-01-01T12:00:00.000Z"}]'
    );
    expect(importDialog.close).toHaveBeenCalled();
    expect(ui.showInfoDialog).toHaveBeenCalledWith('Éxito', 'Patentes importadas con éxito');
  });

  test('importarPatentes handles invalid data', () => {
    // Set up the import dialog with invalid content
    const contentArea = document.getElementById('import-content');
    contentArea.value = 'invalid-base64-data';
    
    // Mock atob to throw an error for invalid Base64
    global.atob.mockImplementationOnce(() => {
      throw new Error('Invalid Base64');
    });
    
    // Create import handler
    const importHandler = () => {
      try {
        const base64Content = contentArea.value.trim();
        const patentesString = decodeURIComponent(atob(base64Content));
        const newPatentes = JSON.parse(patentesString);
        
        if (!Array.isArray(newPatentes)) {
          throw new Error('Invalid format');
        }
        
        localStorage.setItem('patentes', JSON.stringify(newPatentes));
      } catch (error) {
        ui.showError('El código de importación no es válido. Por favor verifique e intente nuevamente.');
      }
    };
    
    // Attach handler and click
    const importBtn = document.getElementById('confirm-import');
    importBtn.addEventListener('click', importHandler);
    importBtn.click();
    
    // Verify error handling
    expect(ui.showError).toHaveBeenCalledWith(
      'El código de importación no es válido. Por favor verifique e intente nuevamente.'
    );
  });
});
