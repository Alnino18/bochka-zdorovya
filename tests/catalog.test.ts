import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import {
  BUSINESS_CONTACTS,
  SERVICE_CATEGORIES,
  PRICE_LIST_DATA,
  formatPriceUZS,
  formatDuration,
} from '../src/constants/catalogData';
import { PriceListView } from '../src/components/prices/PriceListView';
import { LanguageProvider } from '../src/context/LanguageContext';

describe('Milestone M2: Service Catalog & Price List View', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Authoritative Catalog Data Model', () => {
    it('contains exactly 8 service categories', () => {
      expect(SERVICE_CATEGORIES).toHaveLength(8);
      expect(PRICE_LIST_DATA.categories).toHaveLength(8);
    });

    it('covers all 10 duration & price combinations matching priceListData.json', () => {
      // 1. Оздоровительный (40m: 300k, 60m: 320k)
      const cat1 = SERVICE_CATEGORIES.find((c) => c.categoryNumber === 1);
      expect(cat1).toBeDefined();
      expect(cat1?.nameRu).toBe('Фитобочка, Сауна, Массаж (оздоровительный)');
      expect(cat1?.nameUz).toBe("Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)");
      expect(cat1?.options).toEqual([
        expect.objectContaining({ durationMinutes: 40, priceUZS: 300000 }),
        expect.objectContaining({ durationMinutes: 60, priceUZS: 320000 }),
      ]);

      // 2. Медовый (40m: 350k, 60m: 400k)
      const cat2 = SERVICE_CATEGORIES.find((c) => c.categoryNumber === 2);
      expect(cat2).toBeDefined();
      expect(cat2?.nameRu).toBe('Фитобочка, Сауна, Массаж (медовый)');
      expect(cat2?.nameUz).toBe('Fitobochka, Sauna, Massaj (asalli)');
      expect(cat2?.options).toEqual([
        expect.objectContaining({ durationMinutes: 40, priceUZS: 350000 }),
        expect.objectContaining({ durationMinutes: 60, priceUZS: 400000 }),
      ]);

      // 3. Пилинг (60m: 400k)
      const cat3 = SERVICE_CATEGORIES.find((c) => c.categoryNumber === 3);
      expect(cat3).toBeDefined();
      expect(cat3?.nameRu).toBe('Фитобочка, Сауна, Пилинг');
      expect(cat3?.nameUz).toBe('Fitobochka, Sauna, Piling');
      expect(cat3?.options).toHaveLength(1);
      expect(cat3?.options[0]).toEqual(
        expect.objectContaining({ durationMinutes: 60, priceUZS: 400000 })
      );

      // 4. Арома массаж (40m: 350k, 60m: 400k)
      const cat4 = SERVICE_CATEGORIES.find((c) => c.categoryNumber === 4);
      expect(cat4?.nameRu).toBe('Арома массаж');
      expect(cat4?.nameUz).toBe('Aroma massaj');
      expect(cat4?.options).toEqual([
        expect.objectContaining({ durationMinutes: 40, priceUZS: 350000 }),
        expect.objectContaining({ durationMinutes: 60, priceUZS: 400000 }),
      ]);

      // 5. Точечный массаж (40m: 350k, 60m: 400k)
      const cat5 = SERVICE_CATEGORIES.find((c) => c.categoryNumber === 5);
      expect(cat5?.nameRu).toBe('Точечный массаж');
      expect(cat5?.nameUz).toBe('Nuqtali massaj');
      expect(cat5?.options).toEqual([
        expect.objectContaining({ durationMinutes: 40, priceUZS: 350000 }),
        expect.objectContaining({ durationMinutes: 60, priceUZS: 400000 }),
      ]);

      // 6. Лечебный массаж (40m: 350k, 60m: 400k)
      const cat6 = SERVICE_CATEGORIES.find((c) => c.categoryNumber === 6);
      expect(cat6?.nameRu).toBe('Лечебный массаж');
      expect(cat6?.nameUz).toBe('Davolovchi massaj');
      expect(cat6?.options).toEqual([
        expect.objectContaining({ durationMinutes: 40, priceUZS: 350000 }),
        expect.objectContaining({ durationMinutes: 60, priceUZS: 400000 }),
      ]);

      // 7. Хиромассаж (40m: 350k, 60m: 400k)
      const cat7 = SERVICE_CATEGORIES.find((c) => c.categoryNumber === 7);
      expect(cat7?.nameRu).toBe('Хиромассаж');
      expect(cat7?.nameUz).toBe('Xiromassaj');
      expect(cat7?.options).toEqual([
        expect.objectContaining({ durationMinutes: 40, priceUZS: 350000 }),
        expect.objectContaining({ durationMinutes: 60, priceUZS: 400000 }),
      ]);

      // 8. Комбинированный массаж (40m: 350k, 60m: 400k)
      const cat8 = SERVICE_CATEGORIES.find((c) => c.categoryNumber === 8);
      expect(cat8?.nameRu).toBe('Комбинированный массаж');
      expect(cat8?.nameUz).toBe('Kombinatsiyalangan massaj');
      expect(cat8?.options).toEqual([
        expect.objectContaining({ durationMinutes: 40, priceUZS: 350000 }),
        expect.objectContaining({ durationMinutes: 60, priceUZS: 400000 }),
      ]);
    });

    it('verifies exact business contacts details', () => {
      expect(BUSINESS_CONTACTS.phone).toBe('97 002-04-04');
      expect(BUSINESS_CONTACTS.phoneFormatted).toBe('+998 97 002-04-04');
      expect(BUSINESS_CONTACTS.phoneTel).toBe('tel:+998970020404');
      expect(BUSINESS_CONTACTS.instagram).toBe('@Bochka_zdorovya');
      expect(BUSINESS_CONTACTS.instagramUrl).toBe('https://instagram.com/Bochka_zdorovya');
    });

    it('formats prices and durations accurately in both languages', () => {
      expect(formatPriceUZS(300000, 'ru')).toBe('300 000 сум');
      expect(formatPriceUZS(300000, 'uz')).toBe("300 000 so'm");
      expect(formatPriceUZS(400000, 'ru')).toBe('400 000 сум');
      expect(formatPriceUZS(400000, 'uz')).toBe("400 000 so'm");

      expect(formatDuration(40, 'ru')).toBe('40 мин');
      expect(formatDuration(40, 'uz')).toBe('40 daq');
      expect(formatDuration(60, 'ru')).toBe('60 мин');
      expect(formatDuration(60, 'uz')).toBe('60 daq');
    });
  });

  describe('PriceListView Component Rendering & Interactions', () => {
    it('renders all 8 category cards with prices and action links in Russian', () => {
      render(
        React.createElement(
          LanguageProvider,
          { defaultLanguage: 'ru' },
          React.createElement(PriceListView, null)
        )
      );

      expect(screen.getByTestId('section-pricelist')).toBeInTheDocument();

      for (let i = 1; i <= 8; i++) {
        expect(screen.getByTestId(`service-card-${i}`)).toBeInTheDocument();
        expect(screen.getByTestId(`category-badge-${i}`)).toHaveTextContent(`#${i}`);
      }

      // Check Category 1 Russian title
      expect(screen.getByTestId('service-title-1')).toHaveTextContent('Фитобочка, Сауна, Массаж (оздоровительный)');
      // Check Category 8 Russian title
      expect(screen.getByTestId('service-title-8')).toHaveTextContent('Комбинированный массаж');

      // Catalog footer info verification
      const catalogFooter = screen.getByTestId('catalog-footer-info');
      expect(catalogFooter).toBeInTheDocument();
      expect(catalogFooter).toHaveTextContent(BUSINESS_CONTACTS.nameRu || 'Бочка Здоровья');
    });

    it('renders all 8 category cards with bilingual Uzbek titles when language is uz', () => {
      render(
        React.createElement(
          LanguageProvider,
          { defaultLanguage: 'uz' },
          React.createElement(PriceListView, null)
        )
      );

      // Check Category 1 Uzbek title
      expect(screen.getByTestId('service-title-1')).toHaveTextContent("Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)");
      // Check Category 2 Uzbek title
      expect(screen.getByTestId('service-title-2')).toHaveTextContent('Fitobochka, Sauna, Massaj (asalli)');
      // Check Category 3 Uzbek title
      expect(screen.getByTestId('service-title-3')).toHaveTextContent('Fitobochka, Sauna, Piling');
      // Check Category 8 Uzbek title
      expect(screen.getByTestId('service-title-8')).toHaveTextContent('Kombinatsiyalangan massaj');
    });

    it('filters services dynamically by search keyword', () => {
      render(
        React.createElement(
          LanguageProvider,
          { defaultLanguage: 'ru' },
          React.createElement(PriceListView, null)
        )
      );

      const searchInput = screen.getByTestId('catalog-search-input');

      // Filter by 'пилинг' -> should match only Category 3
      fireEvent.change(searchInput, { target: { value: 'пилинг' } });

      expect(screen.getByTestId('service-card-3')).toBeInTheDocument();
      expect(screen.queryByTestId('service-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('service-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('service-card-4')).not.toBeInTheDocument();

      // Clear search -> all 8 categories restored
      const clearBtn = screen.getByTestId('catalog-clear-search');
      fireEvent.click(clearBtn);

      expect(screen.getByTestId('service-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-8')).toBeInTheDocument();
    });

    it('filters services by category group pills (phyto vs massage)', () => {
      render(
        React.createElement(
          LanguageProvider,
          { defaultLanguage: 'ru' },
          React.createElement(PriceListView, null)
        )
      );

      // Click Phyto filter (categories 1, 2, 3)
      fireEvent.click(screen.getByTestId('filter-phyto'));

      expect(screen.getByTestId('service-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-3')).toBeInTheDocument();
      expect(screen.queryByTestId('service-card-4')).not.toBeInTheDocument();
      expect(screen.queryByTestId('service-card-8')).not.toBeInTheDocument();

      // Click Massage filter (categories 4, 5, 6, 7, 8)
      fireEvent.click(screen.getByTestId('filter-massage'));

      expect(screen.queryByTestId('service-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('service-card-3')).not.toBeInTheDocument();
      expect(screen.getByTestId('service-card-4')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-8')).toBeInTheDocument();

      // Click All filter -> all 8 shown
      fireEvent.click(screen.getByTestId('filter-all'));
      expect(screen.getByTestId('service-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-8')).toBeInTheDocument();
    });

    it('filters services by duration (40m vs 60m)', () => {
      render(
        React.createElement(
          LanguageProvider,
          { defaultLanguage: 'ru' },
          React.createElement(PriceListView, null)
        )
      );

      // 40m filter: Category 3 (Piling) only has 60m, so it should not appear
      fireEvent.click(screen.getByTestId('filter-duration-40'));
      expect(screen.queryByTestId('service-card-3')).not.toBeInTheDocument();
      expect(screen.getByTestId('service-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-4')).toBeInTheDocument();

      // 60m filter: All 8 categories have a 60m option
      fireEvent.click(screen.getByTestId('filter-duration-60'));
      expect(screen.getByTestId('service-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-1')).toBeInTheDocument();
    });

    it('displays empty state message and reset button when search query has no match', () => {
      render(
        React.createElement(
          LanguageProvider,
          { defaultLanguage: 'ru' },
          React.createElement(PriceListView, null)
        )
      );

      const searchInput = screen.getByTestId('catalog-search-input');
      fireEvent.change(searchInput, { target: { value: 'несуществующая услуга xyz' } });

      expect(screen.getByTestId('catalog-empty-state')).toBeInTheDocument();
      expect(screen.queryByTestId('service-card-1')).not.toBeInTheDocument();

      // Click reset
      fireEvent.click(screen.getByTestId('catalog-clear-search'));
      expect(screen.getByTestId('service-card-1')).toBeInTheDocument();
    });
  });
});
