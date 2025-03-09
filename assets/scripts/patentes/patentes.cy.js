describe('Patentes App E2E Tests', () => {
    const baseURL = 'http://localhost:5500/patentes.html';

    beforeEach(() => {
        cy.visit(baseURL);
        // Clear localStorage before each test and set theme to light
        cy.window().then((win) => {
            win.localStorage.clear();
            win.localStorage.setItem('theme', 'light');
        });
    });

    it('loads the main page', () => {
        cy.get('#page-title', { timeout: 10000 }).should('contain', 'Traductor de Patentes Diplomáticas');
    });

    it('translates a valid country code', () => {
        cy.get('#patente').type('AA');
        cy.get('button[type="submit"]').first().click();
        cy.get('#traduccion-dialog').should('contain', 'SANTA SEDE');
    });

    it('shows an error for an invalid country code', () => {
        cy.get('#patente').type('ZZ');
        cy.get('button[type="submit"]').first().click();
        cy.get('#error-dialog').should('be.visible');
        cy.get('#error-message').should('contain', 'Código de país no encontrado');
    });

    it('translates a valid diplomatic plate', () => {
        cy.get('#patente').type('D001BGA');
        cy.get('button[type="submit"]').first().click();
        cy.get('#traduccion-dialog').should('contain', 'REINO DE ESPAÑA');
        cy.get('#categoria-dialog').should('contain', 'CUERPO DIPLOMATICO');
    });

    it('captures a location', () => {
        // Mock geolocation
        cy.window().then((win) => {
            cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake((cb, err) => {
                if (cb) {
                    return cb({
                        coords: {
                            latitude: 40.7128,
                            longitude: -74.0060,
                        },
                    });
                }
                if (err) {
                    return err({ code: 1, message: "Geolocation error" });
                }
            });
        });

        cy.get('#patente').type('D001BGA');
        cy.get('button[type="submit"]').first().click();
        cy.get('#capturar').click();
        cy.get('#patentes-capturadas').should('contain', 'D001BGA');
    });

    it('toggles dark mode', () => {
        cy.get('html').should('not.have.class', 'dark'); // Ensure it starts in light mode
        cy.get('#theme-toggle').click();
        cy.get('html').should('have.class', 'dark');
        cy.get('#theme-toggle').click();
        cy.get('html').should('not.have.class', 'dark');
    });
});
