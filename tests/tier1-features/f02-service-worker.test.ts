import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { OfflineBadge } from '../../src/components/layout/OfflineBadge';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { registerServiceWorker } from '../../src/utils/pwa';
import { simulateNetworkStatus } from '../helpers/test-utils';

describe('Tier 1 - Feature F02: Service Worker Offline Cache (R1)', () => {
  const rootDir = process.cwd();
  const swPath = path.resolve(rootDir, 'public/sw.js');

  it('T1-F02-01: verifies service worker registration helper triggers navigator.serviceWorker.register on window load', async () => {
    const registerMock = vi.fn().mockResolvedValue({ scope: '/' });
    const originalNavigator = global.navigator;

    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: {
          register: registerMock,
        },
      },
      writable: true,
      configurable: true,
    });

    registerServiceWorker();
    window.dispatchEvent(new Event('load'));
    expect(registerMock).toHaveBeenCalledWith('/sw.js');
  });

  it('T1-F02-02: verifies sw.js defines cache naming and precaches essential app shell assets', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swSource = fs.readFileSync(swPath, 'utf-8');

    expect(swSource).toContain('CACHE_NAME');
    expect(swSource).toMatch(/STATIC_PRECACHE|PRECACHE_ASSETS/);
    expect(swSource).toContain('/manifest.webmanifest');
    expect(swSource).toContain('/favicon.ico');
    expect(swSource).toContain('skipWaiting()');
  });

  it('T1-F02-03: verifies sw.js implements Stale-While-Revalidate caching pattern for assets', () => {
    const swSource = fs.readFileSync(swPath, 'utf-8');
    expect(swSource).toContain("self.addEventListener('fetch'");
    expect(swSource).toContain('caches.open');
    expect(swSource).toContain('cache.put');
  });

  it('T1-F02-04: verifies sw.js handles offline navigation fallback to index.html', () => {
    const swSource = fs.readFileSync(swPath, 'utf-8');
    expect(swSource).toContain("request.mode === 'navigate'");
    expect(swSource).toMatch(/\/index\.html/);
  });

  it('T1-F02-05: verifies OfflineBadge displays warning when offline and hides when online', () => {
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(OfflineBadge, null)
      )
    );

    // Initial state: online -> badge not rendered
    expect(screen.queryByTestId('offline-badge')).not.toBeInTheDocument();

    // Trigger offline
    act(() => {
      simulateNetworkStatus(false);
    });
    const offlineBadge = screen.getByTestId('offline-badge');
    expect(offlineBadge).toBeInTheDocument();
    expect(offlineBadge.textContent).toMatch(/Офлайн|Oflayn/i);

    // Trigger online
    act(() => {
      simulateNetworkStatus(true);
    });
    expect(screen.queryByTestId('offline-badge')).not.toBeInTheDocument();
  });
});
