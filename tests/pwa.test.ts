import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('PWA Infrastructure & Web App Manifest', () => {
  const rootDir = path.resolve('.');
  const manifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');
  const swPath = path.join(rootDir, 'public', 'sw.js');
  const indexPath = path.join(rootDir, 'index.html');

  it('should have a valid W3C Web App Manifest file', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe('Бочка Здоровья - Салон & Учёт');
    expect(manifest.short_name).toBe('БочкаЗдоровья');
    expect(manifest.start_url).toBe('./');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0d9488');
    expect(manifest.background_color).toBe('#0f172a');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
  });

  it('should reference existing and valid icon files in manifest', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    // Check required icon resolutions
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    // Check maskable icons
    const purposes = manifest.icons.map((icon: { purpose?: string }) => icon.purpose);
    expect(purposes).toContain('maskable');

    // Verify all icon files exist and are valid on disk
    for (const icon of manifest.icons) {
      const relPath = icon.src.replace(/^\//, '');
      const fullPath = path.join(rootDir, 'public', relPath);
      expect(fs.existsSync(fullPath), `Icon file ${fullPath} should exist`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(0);

      if (icon.type === 'image/png') {
        const buffer = fs.readFileSync(fullPath);
        // Valid PNG header: 0x89 0x50 0x4e 0x47 0x0d 0x0a 0x1a 0x0a
        expect(buffer[0]).toBe(0x89);
        expect(buffer[1]).toBe(0x50); // P
        expect(buffer[2]).toBe(0x4e); // N
        expect(buffer[3]).toBe(0x47); // G
      }
    }
  });

  it('should have a valid Service Worker with offline & stale-while-revalidate strategies', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, 'utf-8');

    // Lifecycle events
    expect(swContent).toContain("addEventListener('install'");
    expect(swContent).toContain("addEventListener('activate'");
    expect(swContent).toContain("addEventListener('fetch'");

    // Caching logic
    expect(swContent).toContain('caches.open');
    expect(swContent).toContain('skipWaiting');
    expect(swContent).toContain('clients.claim');

    // Offline navigation fallback
    expect(swContent).toContain("request.mode === 'navigate'");
    expect(swContent).toMatch(/\/index\.html/);
  });

  it('should contain all required Apple and PWA meta tags in index.html', () => {
    expect(fs.existsSync(indexPath)).toBe(true);
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    expect(indexContent).toContain('apple-mobile-web-app-capable');
    expect(indexContent).toContain('apple-mobile-web-app-status-bar-style');
    expect(indexContent).toContain('apple-mobile-web-app-title');
    expect(indexContent).toContain('theme-color');
    expect(indexContent).toContain('#0d9488');
    expect(indexContent).toContain('manifest.webmanifest');
  });
});
