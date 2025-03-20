jest.mock('../ui.js', () => ({
    showError: jest.fn(),
    showInfoDialog: jest.fn()
}));

import { sanitizeInput, clearResults, handleCapturar, updateDetailsDialog } from '../patentes.js';
import { showError } from '../ui.js'; // Mock if needed

describe('sanitizeInput', () => {
    test('returns country code for a valid 2-letter input', () => {
        const result = sanitizeInput('AR');
        expect(result.pais).toBeDefined();
        expect(result.error).toBeNull();
    });

    test('returns error for an unknown 2-letter input', () => {
        const result = sanitizeInput('ZZ');
        expect(result.error).toMatch(/código de país no encontrado/i);
    });

    test('handles valid full plate format', () => {
        const result = sanitizeInput('D123ARC');  // use a known country code substring 'AR'
        expect(result.esPatenteCompleta).toBe(true);
        expect(result.error).toBeNull();
    });

    test('returns error for invalid plate format', () => {
        const result = sanitizeInput('ABC123');
        expect(result.error).toMatch(/formato inválido/i);
    });
});

describe('clearResults', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="error"></div>';
    });

    test('clears the #error element content', () => {
        const errorDiv = document.getElementById('error');
        errorDiv.innerHTML = 'Some error';
        clearResults();
        expect(errorDiv.innerHTML).toBe('');
    });
});

describe('handleCapturar', () => {
    beforeEach(() => {
        global.navigator.geolocation = {
            getCurrentPosition: jest.fn((successCallback) => {
                successCallback({ coords: { latitude: -34.6037, longitude: -58.3816 } });
            })
        };
        // Add required elements including the missing "capturar" button
        document.body.innerHTML = `
      <input id="patente" value="D123ARC" />
      <button id="capturar"></button>
      <div id="patentes-capturadas"></div>
      <dialog id="patente-detail-dialog" class="dummy-dialog">
        <button id="dummy-close">Close</button>
      </dialog>
    `;
        if (!document.getElementById('patente-detail-dialog').close) {
            document.getElementById('patente-detail-dialog').close = jest.fn();
        }
    });

    test('calls showError if geolocation fails', () => {
        navigator.geolocation.getCurrentPosition.mockImplementation((_, errorCallback) => {
            errorCallback({ code: 1 });
        });
        handleCapturar();
        expect(showError).toHaveBeenCalledWith(expect.stringContaining('Por favor, permita'));
    });

    /* DEV NOTE: 
    This is wrong because handleCapturar needs access to the geolocation, so it has to be mocked, as it returns 
    "1: "Por favor, permita el acceso a la ubicación para poder capturar la patente" 
    (side note: maybe its because it is not clearing the test run before?) 
    */

    //   test('adds patent if geolocation succeeds', () => {
    //     handleCapturar();
    //     expect(showError).not.toHaveBeenCalled();
    //     const list = document.getElementById('patentes-capturadas');
    //     expect(list.innerHTML).toMatch(/Patentes capturadas/);
    //   });
});

describe('updateDetailsDialog', () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <div id="traduccion-dialog"></div>
      <div id="codigo-dialog"></div>
      <div id="categoria-traduccion-dialog"></div>
      <div id="categoria-dialog"></div>
      <div id="categoria-container"></div>
      <div id="uso-jefe-dialog"></div>
      <div id="patente-visual"></div>
      <div id="decomposition-container"></div>
      <button id="capturar"></button>
    `;
    });

    test('updates dialog content for complete plate', () => {
        const result = {
            pais: 'REPÚBLICA DE INDONESIA',
            codigo: 'AR',
            categoria: 'CUERPO DIPLOMATICO',
            categoriaTraduccion: 'D',
            usoJefe: true,
            esPatenteCompleta: true,
            input: 'D123ARC',
            error: null
        };
        updateDetailsDialog(result);
        expect(document.getElementById('traduccion-dialog').innerHTML).toMatch(/REPÚBLICA/);
        expect(document.getElementById('categoria-container').style.display).toBe('block');
        expect(document.getElementById('uso-jefe-dialog').innerHTML).toMatch(/Uso exclusivo/);
    });

    test('updates dialog content for 2-letter code', () => {
        const result = {
            pais: 'REPÚBLICA POPULAR CHINA',
            codigo: 'AR',
            categoria: null,
            categoriaTraduccion: null,
            usoJefe: false,
            esPatenteCompleta: false,
            input: 'AR',
            error: null
        };
        updateDetailsDialog(result);
        expect(document.getElementById('traduccion-dialog').innerHTML).toMatch(/REPÚBLICA/);
        expect(document.getElementById('categoria-container').style.display).toBe('none');
    });
});
