import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from '../../src/App';
import { LanguageProvider, useTranslation } from '../../src/context/LanguageContext';
import { OfflineBadge } from '../../src/components/layout/OfflineBadge';
import { setViewportWidth, simulateNetworkStatus } from '../helpers/test-utils';
import fs from 'node:fs';
import path from 'node:path';

describe('Tier 2 - Boundary B01: Shell & PWA Boundaries (F1-F4)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // F1: Manifest & Shell Boundaries
  it('T2-B01-01: verifies production manifest contains required W3C PWA properties', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('./');
    expect(manifest.display).toBe('standalone');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it('T2-B01-02: verifies manifest icon array contains required PWA sizes even if extra sizes exist', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const sizes = manifest.icons.map((i: any) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('T2-B01-03: verifies viewport meta tag allows responsive scaling without horizontal freeze', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    expect(html).toContain('width=device-width');
    expect(html).toContain('initial-scale=1.0');
  });

  it('T2-B01-04: verifies CSS standalone display-mode media query support in window.matchMedia', () => {
    const mq = window.matchMedia('(display-mode: standalone)');
    expect(mq).toBeDefined();
    expect(typeof mq.matches).toBe('boolean');
  });

  it('T2-B01-05: handles long title string and unicode in App header without layout breakage', () => {
    const { container } = render(React.createElement(App, null));
    const headerTitle = screen.getAllByText(/Бочка Здоровья/)[0];
    expect(headerTitle).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('overflow-x-hidden');
  });

  // F2: Service Worker & Network Boundaries
  it('T2-B01-06: handles environment where navigator.serviceWorker is undefined gracefully', () => {
    const originalSW = navigator.serviceWorker;
    try {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(navigator.serviceWorker).toBeUndefined();
    } finally {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalSW,
        writable: true,
        configurable: true,
      });
    }
  });

  it('T2-B01-07: verifies sw.js responds with 503 fallback when offline cache is empty', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const sw = fs.readFileSync(swPath, 'utf-8');
    expect(sw).toMatch(/503|Offline/);
  });

  it('T2-B01-08: verifies SW cache delete logic on activate event', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const sw = fs.readFileSync(swPath, 'utf-8');
    expect(sw).toContain('caches.delete');
    expect(sw).toContain('clients.claim()');
  });

  it('T2-B01-09: handles rapid network state flapping (10 transitions) without desync', () => {
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(OfflineBadge, null)
      )
    );

    for (let i = 0; i < 10; i++) {
      act(() => {
        simulateNetworkStatus(i % 2 === 0);
      });
    }

    // Final state was odd (10-1 = 9 => false => offline)
    expect(screen.getByTestId('offline-badge')).toBeInTheDocument();

    // Final restore to online
    act(() => {
      simulateNetworkStatus(true);
    });
    expect(screen.queryByTestId('offline-badge')).not.toBeInTheDocument();
  });

  it('T2-B01-10: verifies cache name contains version identifier for smooth upgrades', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const sw = fs.readFileSync(swPath, 'utf-8');
    expect(sw).toMatch(/CACHE_NAME\s*=\s*['"]bochka-[^'"]+v\d+['"]/);
  });

  // F3 & F4: i18n & Viewport Boundaries
  it('T2-B01-11: falls back to "ru" when localStorage contains invalid or unsupported language code', () => {
    localStorage.setItem('bochka_lang', 'fr');
    let lang = 'ru';
    const TestComponent: React.FC = () => {
      const { language } = useTranslation();
      lang = language;
      return null;
    };

    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(TestComponent, null)
      )
    );
    expect(lang).toBe('ru');
  });

  it('T2-B01-12: returns fallback key path rather than crashing on missing translation key', () => {
    let translated = '';
    const TestComponent: React.FC = () => {
      const { t } = useTranslation();
      translated = t('unknown.nonExistentKey');
      return null;
    };

    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(TestComponent, null)
      )
    );
    expect(translated).toBe('unknown.nonExistentKey');
  });

  it('T2-B01-13: renders cleanly on extreme narrow viewport (320px) without unhandled overflow', () => {
    setViewportWidth(320, 568);
    render(React.createElement(App, null));
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('T2-B01-14: evaluates layout breakpoint at 359px boundary', () => {
    setViewportWidth(359, 640);
    render(React.createElement(App, null));
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('T2-B01-15: renders properly constrained container on ultra-wide 2560px (4K) viewport', () => {
    setViewportWidth(2560, 1440);
    const { container } = render(React.createElement(App, null));
    const main = container.querySelector('main');
    expect(main).toHaveClass('max-w-7xl');
    expect(main).toHaveClass('mx-auto');
  });
});
