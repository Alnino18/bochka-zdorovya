import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { translations } from '../src/constants/translations';
import { LanguageProvider, useTranslation } from '../src/context/LanguageContext';

describe('Bilingual System (RU / UZ)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Dictionary Completeness', () => {
    it('should have complete and matching keys in both RU and UZ dictionaries', () => {
      expect(translations.ru).toBeDefined();
      expect(translations.uz).toBeDefined();

      const compareKeys = (ruObj: Record<string, unknown>, uzObj: Record<string, unknown>, parentPath = '') => {
        const ruKeys = Object.keys(ruObj);
        const uzKeys = Object.keys(uzObj);

        expect(uzKeys.sort()).toEqual(ruKeys.sort());

        for (const key of ruKeys) {
          const currentPath = parentPath ? `${parentPath}.${key}` : key;
          const ruVal = ruObj[key];
          const uzVal = uzObj[key];

          if (typeof ruVal === 'object' && ruVal !== null) {
            expect(typeof uzVal).toBe('object');
            compareKeys(ruVal as Record<string, unknown>, uzVal as Record<string, unknown>, currentPath);
          } else {
            expect(typeof ruVal).toBe('string');
            expect(typeof uzVal).toBe('string');
            expect((ruVal as string).trim().length).toBeGreaterThan(0);
            expect((uzVal as string).trim().length).toBeGreaterThan(0);
          }
        }
      };

      compareKeys(translations.ru as unknown as Record<string, unknown>, translations.uz as unknown as Record<string, unknown>);
    });

    it('should contain accurate service catalog category translations', () => {
      expect(translations.ru.services.cat1).toContain('Фитобочка, Сауна, Массаж');
      expect(translations.uz.services.cat1).toContain('Fitobochka, Sauna, Massaj');
      expect(translations.ru.services.cat8).toContain('Комбинированный массаж');
      expect(translations.uz.services.cat8).toContain('Kombinatsiyalangan massaj');
    });
  });

  describe('LanguageContext and useTranslation Hook', () => {
    const TestConsumer = () => {
      const { language, setLanguage, toggleLanguage, t } = useTranslation();
      return React.createElement(
        'div',
        null,
        React.createElement('span', { 'data-testid': 'current-lang' }, language),
        React.createElement('span', { 'data-testid': 'translated-title' }, t('app.title')),
        React.createElement('span', { 'data-testid': 'translated-nav' }, t('nav.journal')),
        React.createElement('span', { 'data-testid': 'fallback-test' }, t('missing.dummy.key')),
        React.createElement('button', { 'data-testid': 'btn-to-uz', onClick: () => setLanguage('uz') }, 'Set UZ'),
        React.createElement('button', { 'data-testid': 'btn-to-ru', onClick: () => setLanguage('ru') }, 'Set RU'),
        React.createElement('button', { 'data-testid': 'btn-toggle', onClick: toggleLanguage }, 'Toggle')
      );
    };

    it('should default to RU and read app title in Russian', () => {
      render(React.createElement(LanguageProvider, null, React.createElement(TestConsumer, null)));

      expect(screen.getByTestId('current-lang').textContent).toBe('ru');
      expect(screen.getByTestId('translated-title').textContent).toBe('Бочка Здоровья');
      expect(screen.getByTestId('translated-nav').textContent).toBe('Журнал учета');
    });

    it('should initialize with defaultLanguage when provided', () => {
      render(React.createElement(LanguageProvider, { defaultLanguage: 'uz' }, React.createElement(TestConsumer, null)));

      expect(screen.getByTestId('current-lang').textContent).toBe('uz');
      expect(screen.getByTestId('translated-title').textContent).toBe('Bochka Zdorovya');
      expect(screen.getByTestId('translated-nav').textContent).toBe('Hisobot jurnali');
    });

    it('should respect saved language in localStorage', () => {
      localStorage.setItem('bochka_lang', 'uz');

      render(React.createElement(LanguageProvider, null, React.createElement(TestConsumer, null)));

      expect(screen.getByTestId('current-lang').textContent).toBe('uz');
      expect(screen.getByTestId('translated-title').textContent).toBe('Bochka Zdorovya');
      expect(screen.getByTestId('translated-nav').textContent).toBe('Hisobot jurnali');
    });

    it('should switch language on setLanguage and persist to localStorage', () => {
      render(React.createElement(LanguageProvider, null, React.createElement(TestConsumer, null)));

      act(() => {
        fireEvent.click(screen.getByTestId('btn-to-uz'));
      });

      expect(screen.getByTestId('current-lang').textContent).toBe('uz');
      expect(screen.getByTestId('translated-title').textContent).toBe('Bochka Zdorovya');
      expect(localStorage.getItem('bochka_lang')).toBe('uz');

      act(() => {
        fireEvent.click(screen.getByTestId('btn-to-ru'));
      });

      expect(screen.getByTestId('current-lang').textContent).toBe('ru');
      expect(screen.getByTestId('translated-title').textContent).toBe('Бочка Здоровья');
      expect(localStorage.getItem('bochka_lang')).toBe('ru');
    });

    it('should toggle language using toggleLanguage', () => {
      render(React.createElement(LanguageProvider, null, React.createElement(TestConsumer, null)));

      expect(screen.getByTestId('current-lang').textContent).toBe('ru');

      act(() => {
        fireEvent.click(screen.getByTestId('btn-toggle'));
      });

      expect(screen.getByTestId('current-lang').textContent).toBe('uz');
      expect(localStorage.getItem('bochka_lang')).toBe('uz');

      act(() => {
        fireEvent.click(screen.getByTestId('btn-toggle'));
      });

      expect(screen.getByTestId('current-lang').textContent).toBe('ru');
      expect(localStorage.getItem('bochka_lang')).toBe('ru');
    });

    it('should gracefully handle missing keys', () => {
      render(React.createElement(LanguageProvider, null, React.createElement(TestConsumer, null)));

      expect(screen.getByTestId('fallback-test').textContent).toBe('missing.dummy.key');
    });
  });
});
