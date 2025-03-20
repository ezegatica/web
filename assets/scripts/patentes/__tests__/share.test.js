import { toggleDevMode } from '../patentes.js';
import { initShare } from '../share.js';
import { showError, showInfoDialog } from '../ui.js';

// Mock modules and globals
jest.mock('../ui.js');

describe('Share functionality', () => {
    let originalNavigator;
    let mockShare;
    let mockFetch;

    beforeEach(() => {
        // Setup DOM elements needed for tests
        document.body.innerHTML = `
            <button id="compartir-whatsapp">Share</button>
            <div id="detail-container">
                <div class="dialog-footer"></div>
                <div class="content">Test content</div>
            </div>
            <input id="patente" value="TEST123" />
        `;

        // Mock documentElement for dark mode checks
        Object.defineProperty(document, 'documentElement', {
            value: {
                classList: {
                    contains: jest.fn().mockReturnValue(false)
                }
            },
            writable: true
        });

        // Mock fetch API
        mockFetch = jest.fn().mockResolvedValue({
            blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }))
        });
        global.fetch = mockFetch;

        // Mock html2canvas with better implementation
        global.html2canvas = jest.fn().mockImplementation(() => {
            return Promise.resolve({
                toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,testdata')
            });
        });

        // Store original navigator
        originalNavigator = global.navigator;

        // Mock navigator.share
        mockShare = jest.fn().mockResolvedValue(undefined);
        global.navigator = {
            ...originalNavigator,
            share: mockShare,
            canShare: jest.fn().mockReturnValue(true),
            userAgent: 'test-agent'
        };

        // Mock window.open for mobile fallback
        global.window.open = jest.fn();

        // Reset mocked functions
        showError.mockClear();
        showInfoDialog.mockClear();
    });

    afterEach(() => {
        // Restore mocks
        global.navigator = originalNavigator;
        delete global.fetch;
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('initShare adds click handler to WhatsApp share button', () => {
        const button = document.getElementById('compartir-whatsapp');
        const addEventListenerSpy = jest.spyOn(button, 'addEventListener');

        initShare({ showErrorFn: showError });;

        expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('sharing shows error on capture failure', async () => {
        // Make html2canvas fail
        global.html2canvas.mockRejectedValue(new Error('Capture failed'));

        initShare({ showErrorFn: showError });
        const button = document.getElementById('compartir-whatsapp');

        await button.click();

        expect(showError).toHaveBeenCalledWith('Ocurrió un error al generar la imagen para compartir.');
    });

});
