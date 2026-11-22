import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../src/App';
import { ThemeProvider, useTheme } from '../../src/context/ThemeContext';

describe('Feature F17: Day/Night (Light/Dark Mode) System & iOS Theme Design', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('T1-F17-01: defaults to Light mode, clean white background and dark typography', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // Verify root HTML element does not have dark class by default
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Verify theme toggle button exists in Header
    const toggleBtn = screen.getByTestId('theme-toggle-btn');
    expect(toggleBtn).toBeInTheDocument();

    // In Light mode, toggle button shows option to switch to Night (Ночь / Tun)
    expect(toggleBtn.textContent).toContain('Ночь');
  });

  it('T1-F17-02: toggles between Light and Dark mode on theme-toggle-btn click and persists in localStorage', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    const toggleBtn = screen.getByTestId('theme-toggle-btn');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to switch to Dark / Night mode
    act(() => {
      fireEvent.click(toggleBtn);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme-mode')).toBe('dark');
    expect(toggleBtn.textContent).toContain('День');

    // Click again to switch back to Light / Day mode
    act(() => {
      fireEvent.click(toggleBtn);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme-mode')).toBe('light');
    expect(toggleBtn.textContent).toContain('Ночь');
  });

  it('T1-F17-03: restores dark theme from localStorage on initial boot', () => {
    localStorage.setItem('theme-mode', 'dark');

    render(React.createElement(App, { initialDate: '2026-11-19' }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const toggleBtn = screen.getByTestId('theme-toggle-btn');
    expect(toggleBtn.textContent).toContain('День');
  });

  it('T1-F17-04: updates meta theme-color tag to match active theme', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    expect(metaThemeColor?.getAttribute('content')).toBe('#ffffff');

    const toggleBtn = screen.getByTestId('theme-toggle-btn');
    act(() => {
      fireEvent.click(toggleBtn);
    });

    metaThemeColor = document.querySelector('meta[name="theme-color"]');
    expect(metaThemeColor?.getAttribute('content')).toBe('#000000');
  });

  it('T1-F17-05: bilingual labels for theme toggle (Ночь/День in RU, Tun/Kun in UZ)', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    const toggleBtn = screen.getByTestId('theme-toggle-btn');
    expect(toggleBtn.textContent).toContain('Ночь');

    // Switch language to Uzbek
    const langUzBtn = screen.getByTestId('lang-btn-uz');
    fireEvent.click(langUzBtn);

    // In Uzbek, Night is Tun
    expect(toggleBtn.textContent).toContain('Tun');

    // Switch to dark mode
    act(() => {
      fireEvent.click(toggleBtn);
    });

    // In Uzbek, Day is Kun
    expect(toggleBtn.textContent).toContain('Kun');
  });

  it('T1-F17-06: ThemeProvider provides hook with setTheme method', () => {
    const TestComponent = () => {
      const { theme, setTheme } = useTheme();
      return (
        <div>
          <span data-testid="current-theme">{theme}</span>
          <button data-testid="set-dark-btn" onClick={() => setTheme('dark')}>
            Dark
          </button>
        </div>
      );
    };

    render(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(TestComponent, null)
      )
    );

    expect(screen.getByTestId('current-theme').textContent).toBe('light');

    act(() => {
      fireEvent.click(screen.getByTestId('set-dark-btn'));
    });

    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(localStorage.getItem('theme-mode')).toBe('dark');
  });
});
