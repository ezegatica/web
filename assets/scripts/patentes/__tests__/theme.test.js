import { setupThemeToggle } from '../ui.js';

describe('setupThemeToggle', () => {
  beforeEach(() => {
    localStorage.removeItem('theme');
    document.body.innerHTML = `
      <button id="theme-toggle">Toggle</button>
    `;
    // Ensure default state is light if no theme saved
    document.documentElement.classList.remove('dark');
  });

  test('defaults to light theme when no value is saved', () => {
    setupThemeToggle();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('toggles theme and updates localStorage', () => {
    setupThemeToggle();

    const btn = document.getElementById('theme-toggle');
    // Simulate click event to set dark mode
    btn.click();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    // Simulate another click to revert to light mode
    btn.click();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('respects saved dark theme', () => {
    localStorage.setItem('theme', 'dark');
    setupThemeToggle();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
