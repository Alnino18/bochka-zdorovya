import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { StoreProvider } from '../../src/context/StoreContext';

// Authoritative calculation engine re-exported directly from production code
export { calculateDaySummary, formatCurrencyUZS } from '../../src/utils/calculations';

/**
 * Custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  language?: 'ru' | 'uz';
}

/**
 * Render component wrapped with essential app providers (LanguageProvider and StoreProvider)
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const { language = 'ru', ...renderOptions } = options || {};
  localStorage.setItem('bochka_lang', language);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <LanguageProvider defaultLanguage={language}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </LanguageProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Resizes the test viewport and fires window resize event
 */
export function setViewportWidth(width: number, height = 800): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
}

/**
 * Simulates browser online/offline status changes
 */
export function simulateNetworkStatus(online: boolean): void {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    configurable: true,
    value: online,
  });
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}

/**
 * Simulates PWA beforeinstallprompt event
 */
export function simulateBeforeInstallPrompt(): {
  event: Event;
  promptMock: ReturnType<typeof vi.fn>;
} {
  const promptMock = vi.fn().mockResolvedValue(undefined);
  const event = new Event('beforeinstallprompt') as any;
  event.prompt = promptMock;
  event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
  window.dispatchEvent(event);
  return { event, promptMock };
}
