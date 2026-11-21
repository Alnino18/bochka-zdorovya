import { describe, it, expect } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';
import { SERVICE_CATEGORIES, BUSINESS_CONTACTS } from '../../src/constants/catalogData';
import {
  formatCurrencyUZS,
  sanitizePhoneToTelUri,
  normalizeInstagramUrl,
} from '../../src/utils/calculations';
import { PriceListView } from '../../src/components/prices/PriceListView';
import { App } from '../../src/App';
import { renderWithProviders } from '../helpers/test-utils';

describe('Tier 2 - Boundary B02: Catalog & Contacts Boundaries (F5-F6)', () => {
  // F5 Catalog Boundaries
  it('T2-B02-01: verifies Category 3 (Пилинг) strictly contains exactly 1 duration option', () => {
    const cat3 = SERVICE_CATEGORIES.find(c => c.categoryNumber === 3);
    expect(cat3?.options).toHaveLength(1);
    expect(cat3?.options[0].durationMinutes).toBe(60);
  });

  it('T2-B02-02: verifies all categories with multiple options order duration ascending (40m < 60m)', () => {
    const multiOptionCats = SERVICE_CATEGORIES.filter(c => c.options.length > 1);
    for (const cat of multiOptionCats) {
      expect(cat.options[0].durationMinutes).toBeLessThan(cat.options[1].durationMinutes);
    }
  });

  it('T2-B02-03: handles empty categories list gracefully without throwing in PriceListView UI', () => {
    renderWithProviders(React.createElement(PriceListView, { categories: [] }));
    expect(screen.getByTestId('no-services-message')).toBeInTheDocument();
  });

  it('T2-B02-04: formats large prices (10,000,000 UZS) with correct thousand separators', () => {
    const largePrice = 10000000;
    const formatted = formatCurrencyUZS(largePrice, 'ru');
    expect(formatted).toBe('10 000 000 UZS');
  });

  it('T2-B02-05: enforces strict ascending categoryNumber sort invariant on production catalog', () => {
    SERVICE_CATEGORIES.forEach((cat, idx) => {
      expect(cat.categoryNumber).toBe(idx + 1);
    });
  });

  it('T2-B02-06: handles zero-price promotional option (0 UZS) correctly in formatter', () => {
    const zeroPrice = 0;
    expect(formatCurrencyUZS(zeroPrice, 'ru')).toBe('0 UZS');
    expect(formatCurrencyUZS(zeroPrice, 'uz')).toBe("0 so'm");
  });

  it('T2-B02-07: verifies all categoryNumbers from 1 to 8 are unique', () => {
    const numbers = SERVICE_CATEGORIES.map(c => c.categoryNumber);
    const uniqueNumbers = new Set(numbers);
    expect(uniqueNumbers.size).toBe(8);
  });

  it('T2-B02-08: rounds fractional price amounts to nearest integer UZS', () => {
    const fractionalPrice = 320000.75;
    expect(formatCurrencyUZS(fractionalPrice, 'ru')).toBe('320 001 UZS');
  });

  it('T2-B02-09: verifies every category provides both Russian (nameRu) and Uzbek (nameUz) titles', () => {
    for (const cat of SERVICE_CATEGORIES) {
      expect(cat.nameRu.trim().length).toBeGreaterThan(0);
      expect(cat.nameUz.trim().length).toBeGreaterThan(0);
    }
  });

  it('T2-B02-10: correctly filters categories providing 40-minute vs 60-minute sessions', () => {
    const has40 = SERVICE_CATEGORIES.filter(c =>
      c.options.some(o => o.durationMinutes === 40)
    );
    const has60 = SERVICE_CATEGORIES.filter(c =>
      c.options.some(o => o.durationMinutes === 60)
    );
    expect(has40).toHaveLength(7); // All except Category 3
    expect(has60).toHaveLength(8); // All 8 categories
  });

  // F6 Contacts Boundaries
  it('T2-B02-11: sanitizes phone strings with spaces and dashes into clean numeric tel: URI via production utility', () => {
    const messyPhone = '+998 (97) 002-04-04';
    expect(sanitizePhoneToTelUri(messyPhone)).toBe('tel:+998970020404');
  });

  it('T2-B02-12: handles empty or missing phone gracefully without generating malformed tel: URI', () => {
    expect(sanitizePhoneToTelUri('')).toBeNull();
    expect(sanitizePhoneToTelUri('   ')).toBeNull();
  });

  it('T2-B02-13: normalizes Instagram handles regardless of leading "@" character via production utility', () => {
    expect(normalizeInstagramUrl('@Bochka_zdorovya')).toBe('https://instagram.com/Bochka_zdorovya');
    expect(normalizeInstagramUrl('Bochka_zdorovya')).toBe('https://instagram.com/Bochka_zdorovya');
  });

  it('T2-B02-14: enforces reverse tabnabbing defense (rel="noopener noreferrer") on any external links in DOM', () => {
    const { container } = renderWithProviders(React.createElement(App, null));
    const blankLinks = container.querySelectorAll('a[target="_blank"]');
    blankLinks.forEach((link) => {
      const rel = link.getAttribute('rel') || '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });

  it('T2-B02-15: validates Instagram URL uses secure HTTPS protocol in business contacts', () => {
    expect(BUSINESS_CONTACTS.instagramUrl.startsWith('https://')).toBe(true);
  });
});
