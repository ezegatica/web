import { updateDetailsDialog } from '../patentes.js';

describe('updateDetailsDialog and visual decomposition', () => {
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
    // Set up a dummy global flag for captured plate
    window.viewingCapturedPlate = false;
  });

  test('for complete plate, displays capture button and renders decomposition', () => {
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
    expect(document.getElementById('capturar').style.display).toBe('inline');
    // Check that the visual container contains 4 span parts
    const spans = document.querySelectorAll('#patente-visual span');
    expect(spans.length).toBe(4);
  });

  test('for 2-letter input, hides capture button and shows plain visualization', () => {
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
    expect(document.getElementById('capturar').style.display).toBe('none');
    const spans = document.querySelectorAll('#patente-visual span');
    expect(spans.length).toBe(1);
  });

  test('for unrecognized pattern, hides decomposition container', () => {
    const result = {
      pais: null,
      codigo: null,
      categoria: null,
      categoriaTraduccion: null,
      usoJefe: false,
      esPatenteCompleta: false,
      input: 'XYZ',
      error: "Formato inválido. Debe ser un código de país de 2 letras o una patente completa en formato letra+3números+2letras+letra"
    };
    updateDetailsDialog(result);
    expect(document.getElementById('decomposition-container').style.display).toBe('none');
  });
});
