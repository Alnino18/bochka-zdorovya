import { describe, it, expect } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';
import { SERVICE_CATEGORIES } from '../../src/constants/catalogData';
import { PriceListView } from '../../src/components/prices/PriceListView';
import { renderWithProviders } from '../helpers/test-utils';

describe('Tier 1 - Feature F05: Service Catalog & Price List (R2)', () => {
  it('T1-F05-01: verifies exactly 8 service categories and 15 total duration options exist in production catalog and renders UI', () => {
    expect(SERVICE_CATEGORIES).toHaveLength(8);

    const totalOptions = SERVICE_CATEGORIES.reduce(
      (sum, cat) => sum + cat.options.length,
      0
    );
    expect(totalOptions).toBe(15);

    renderWithProviders(React.createElement(PriceListView, null));
    expect(screen.getByTestId('price-list-container')).toBeInTheDocument();
    expect(screen.getByTestId('service-categories-list')).toBeInTheDocument();
  });

  it('T1-F05-02: verifies Category 1 (Оздоровительный) has 40m (300k) and 60m (320k) options', () => {
    const cat1 = SERVICE_CATEGORIES.find(c => c.categoryNumber === 1);
    expect(cat1).toBeDefined();
    expect(cat1!.nameRu).toContain('оздоровительный');
    expect(cat1!.options).toHaveLength(2);

    const opt40 = cat1!.options.find(o => o.durationMinutes === 40);
    const opt60 = cat1!.options.find(o => o.durationMinutes === 60);

    expect(opt40?.priceUZS).toBe(300000);
    expect(opt60?.priceUZS).toBe(320000);
  });

  it('T1-F05-03: verifies Category 2 (Медовый) has 40m (350k) and 60m (400k) options', () => {
    const cat2 = SERVICE_CATEGORIES.find(c => c.categoryNumber === 2);
    expect(cat2).toBeDefined();
    expect(cat2!.nameRu).toContain('медовый');
    expect(cat2!.options).toHaveLength(2);

    const opt40 = cat2!.options.find(o => o.durationMinutes === 40);
    const opt60 = cat2!.options.find(o => o.durationMinutes === 60);

    expect(opt40?.priceUZS).toBe(350000);
    expect(opt60?.priceUZS).toBe(400000);
  });

  it('T1-F05-04: verifies Category 3 (Пилинг) has only single 60m (400k) option', () => {
    const cat3 = SERVICE_CATEGORIES.find(c => c.categoryNumber === 3);
    expect(cat3).toBeDefined();
    expect(cat3!.nameRu).toContain('Пилинг');
    expect(cat3!.options).toHaveLength(1);

    expect(cat3!.options[0].durationMinutes).toBe(60);
    expect(cat3!.options[0].priceUZS).toBe(400000);
  });

  it('T1-F05-05: verifies Categories 4 to 8 all have standard pricing (40m: 350k, 60m: 400k)', () => {
    const categories4to8 = SERVICE_CATEGORIES.filter(c => c.categoryNumber >= 4 && c.categoryNumber <= 8);
    expect(categories4to8).toHaveLength(5);

    for (const cat of categories4to8) {
      expect(cat.options).toHaveLength(2);
      const opt40 = cat.options.find(o => o.durationMinutes === 40);
      const opt60 = cat.options.find(o => o.durationMinutes === 60);

      expect(opt40?.priceUZS).toBe(350000);
      expect(opt60?.priceUZS).toBe(400000);
    }
  });
});
