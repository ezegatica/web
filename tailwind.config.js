/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./assets/**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        categoria: '#3498db',
        numero: '#2ecc71',
        pais: '#e74c3c',
        uso: '#f39c12',
        dev: '#fff3c4'  
      }
    }
  },
  plugins: [],
}
