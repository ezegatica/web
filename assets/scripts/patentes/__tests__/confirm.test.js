import { showConfirmDialog } from '../ui.js';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = function() {
    this.remove();
  };
});

describe('showConfirmDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('executes onConfirm callback when confirmed', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    showConfirmDialog('Confirm Test', 'Are you sure?', onConfirm, onCancel);

    const dialog = document.querySelector('dialog');
    const confirmBtn = dialog.querySelector('#confirm-action');
    confirmBtn.click();
    // After click, the dialog.close() is called inside showConfirmDialog handler
    expect(onConfirm).toHaveBeenCalled();
    expect(document.querySelector('dialog')).toBeNull();
  });

  test('executes onCancel callback when canceled', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    showConfirmDialog('Confirm Test', 'Are you sure?', onConfirm, onCancel);

    const dialog = document.querySelector('dialog');
    const cancelBtn = dialog.querySelector('#cancel-action');
    cancelBtn.click();
    expect(onCancel).toHaveBeenCalled();
    expect(document.querySelector('dialog')).toBeNull();
  });
});
