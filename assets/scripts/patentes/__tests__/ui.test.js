import { showError, showInfoDialog } from '../ui.js';

beforeAll(() => {
  global.HTMLDialogElement.prototype.showModal = jest.fn();
  global.HTMLDialogElement.prototype.close = jest.fn();
});

describe('UI utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <dialog id="error-dialog">
        <span id="error-message"></span>
      </dialog>
      <dialog id="info-dialog"></dialog>
    `;
  });

  test('showError updates dialog text', () => {
    showError('Test error');
    const messageSpan = document.getElementById('error-message');
    expect(messageSpan.textContent).toBe('Test error');
  });

  test('showInfoDialog creates and shows a dialog', () => {
    showInfoDialog('Info Title', 'Info Message');
    // Find the dialog with the expected text instead of selecting by id
    const dialog = Array.from(document.querySelectorAll('dialog'))
                       .find(d => d.innerHTML.includes('Info Title'));
    expect(dialog).not.toBeUndefined();
    expect(dialog.innerHTML).toMatch(/Info Title/);
    expect(dialog.innerHTML).toMatch(/Info Message/);
  });
});
