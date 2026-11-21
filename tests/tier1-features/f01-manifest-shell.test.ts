import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Tier 1 - Feature F01: PWA Manifest & App Shell (R1)', () => {
  const rootDir = process.cwd();
  const manifestPath = path.resolve(rootDir, 'public/manifest.webmanifest');
  const indexPath = path.resolve(rootDir, 'index.html');

  it('T1-F01-01: parses manifest.webmanifest as valid JSON with core brand identity', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toContain('Бочка Здоровья');
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeDefined();
    expect(['./', '/', '.'].some(prefix => manifest.start_url.startsWith(prefix))).toBe(true);
  });

  it('T1-F01-02: verifies standalone display mode and orientation configuration', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.display).toBe('standalone');
    expect(['portrait-primary', 'portrait', 'any']).toContain(manifest.orientation);
  });

  it('T1-F01-03: verifies icon array includes standard 192x192, 512x512, and maskable icons', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    const sizes = manifest.icons.map((icon: any) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    const hasMaskable = manifest.icons.some(
      (icon: any) => icon.purpose === 'maskable' || icon.purpose === 'any maskable'
    );
    expect(hasMaskable).toBe(true);
  });

  it('T1-F01-04: verifies theme_color and background_color match wellness emerald styling', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    // Theme color matches teal/emerald palette (#0d9488 or #065f46 or #059669)
    expect(manifest.theme_color.toLowerCase()).toBe('#0d9488');
  });

  it('T1-F01-05: verifies index.html specifies manifest link, viewport meta, and Apple PWA tags', () => {
    expect(fs.existsSync(indexPath)).toBe(true);
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');

    // Link to manifest
    expect(indexHtml).toMatch(/<link\s+rel="manifest"\s+href="[^"]*manifest\.webmanifest"/i);

    // Viewport meta
    expect(indexHtml).toMatch(/<meta\s+name="viewport"\s+content="[^"]*width=device-width/i);

    // Apple touch and mobile meta
    expect(indexHtml).toMatch(/<meta\s+name="apple-mobile-web-app-capable"\s+content="yes"/i);
    expect(indexHtml).toMatch(/<link\s+rel="apple-touch-icon"/i);
  });
});
