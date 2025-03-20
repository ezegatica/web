const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'assets/scripts/patentes/patentes.cy.js',
    supportFile: false,
    baseUrl: 'http://localhost:5500',
    video: true,
  },
});
