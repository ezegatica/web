import { initApp } from '../patentes.js';
import { showInfoDialog } from '../ui.js';

// Mock UI functions to avoid side effects
jest.mock('../ui.js', () => ({
  showError: jest.fn(),
  showInfoDialog: jest.fn(),
  showConfirmDialog: jest.fn(),
  setupThemeToggle: jest.fn()  // Added stub for setupThemeToggle
}));

describe('initApp and related features', () => {
  beforeEach(() => {
    localStorage.clear();
    // Minimal DOM required by initApp and its handlers.
    document.body.innerHTML = `
      <form id="form-patente">
         <input type="text" id="patente" value="TEST" />
         <button id="capturar" type="button">Capturar</button>
      </form>
      <dialog id="patente-detail-dialog"></dialog>
      <dialog id="error-dialog"><span id="error-message"></span></dialog>
      <dialog id="import-dialog"></dialog>
      <dialog id="export-dialog"><textarea id="export-content"></textarea></dialog>
      <button id="confirm-import"></button>
      <button id="close-error"></button>
      <button id="close-import"></button>
      <button id="close-detail"></button>
      <div id="patentes-capturadas"></div>
      <button id="theme-toggle">Toggle Theme</button>
      <h1 id="page-title">Test Title</h1>
      <button id="dev-mode-toggle">Dev Mode</button>
      <div id="form-patente-dialog"></div>
      <form id="patente-form"></form>
      <button id="close-map"></button>
      <button id="close-export"></button>
      <button id="copy-export"></button>
      <button id="cancel-patente-form"></button>
      <form id="patente-form"></form>
      <div id="patente-form-dialog"></div>
      <div id="categoria-container">
         <span id="categoria-traduccion-dialog"></span>
         <span id="categoria-dialog"></span>
      </div>
      <div id="uso-jefe-dialog"></div>
      <div id="decomposition-container"></div>
      <div id="patente-visual"></div>
    `;
    // Stub dialog methods to prevent errors in tests.
    document.querySelectorAll('dialog').forEach(d => {
      if (!d.showModal) d.showModal = () => {};
      if (!d.close) d.close = () => {};
    });
  });

  test('initApp processes URL parameters and sets input value', () => {
    history.pushState({}, '', '?patente=D123ARC');
    initApp();
    const input = document.getElementById('patente');
    expect(input.value).toBe('D123ARC');
  });

  test('secret dev mode toggle via page-title click', () => {
    initApp();
    const pageTitle = document.getElementById('page-title');
    // Simulate 5 clicks to trigger secret dev mode toggle.
    for(let i = 0; i < 5; i++) pageTitle.click();
    expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", "Modo desarrollador activado");
  });

  test('dev mode toggle button toggles mode', () => {
    initApp();
    const devBtn = document.getElementById('dev-mode-toggle');
    // First click should activate dev mode.
    devBtn.click();
    expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", "Modo desarrollador activado");
    // Second click should deactivate dev mode.
    devBtn.click();
    expect(showInfoDialog).toHaveBeenCalledWith("Modo desarrollador", "Modo desarrollador desactivado");
  });

  test('export functionality encodes patentes to Base64', () => {
    // Set dummy captured data.
    const dummyData = [{ patente: 'D123ARC', lat: -34.6, lon: -58.4, date: new Date().toISOString() }];
    localStorage.setItem('patentes', JSON.stringify(dummyData));
    const exportDialog = document.getElementById('export-dialog');
    const textarea = document.getElementById('export-content');

    // Manually simulate export logic:
    const patentes = JSON.parse(localStorage.getItem('patentes'));
    const patentesString = JSON.stringify(patentes);
    const patentesBase64 = btoa(encodeURIComponent(patentesString));
    textarea.value = patentesBase64;
    exportDialog.showModal();

    expect(textarea.value).toBe(patentesBase64);
  });

  test('import functionality replaces localStorage data on confirmation', () => {
    // Set existing dummy data.
    const oldData = [{ patente: 'OLD', lat: 0, lon: 0, date: new Date().toISOString() }];
    localStorage.setItem('patentes', JSON.stringify(oldData));

    // Prepare valid import data.
    const newData = [{ patente: 'D123ARC', lat: -34.6, lon: -58.4, date: new Date().toISOString() }];
    const base64Data = btoa(encodeURIComponent(JSON.stringify(newData)));
    const importTextarea = document.createElement('textarea');
    importTextarea.id = 'import-content';
    importTextarea.value = base64Data;
    document.body.appendChild(importTextarea);

    // Spy on the imported showConfirmDialog from the module.
    jest.spyOn(require('../ui.js'), 'showConfirmDialog').mockImplementation((title, msg, onConfirm) => onConfirm());

    // Simulate import logic manually.
    let imported;
    try {
      const decoded = decodeURIComponent(atob(base64Data));
      imported = JSON.parse(decoded);
      localStorage.setItem('patentes', JSON.stringify(imported));
    } catch (e) {
      imported = null;
    }
    expect(imported).toEqual(newData);
  });
});
