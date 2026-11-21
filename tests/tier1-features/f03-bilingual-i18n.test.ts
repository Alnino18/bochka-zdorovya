import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import React from 'react';
import { LanguageProvider, useTranslation } from '../../src/context/LanguageContext';
import { Header } from '../../src/components/layout/Header';
import { translations } from '../../src/constants/translations';

describe('Tier 1 - Feature F03: Bilingual UI Switcher (R1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-F03-01: initializes with Russian (ru) as default language', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
      React.createElement(LanguageProvider, null, children);
    const { result } = renderHook(() => useTranslation(), { wrapper });

    expect(result.current.language).toBe('ru');
    expect(result.current.t('nav.journal')).toBe(translations.ru.nav.journal);
  });

  it('T1-F03-02: toggles language instantly when user triggers setLanguage or button click', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
      React.createElement(LanguageProvider, null, children);
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => {
      result.current.setLanguage('uz');
    });

    expect(result.current.language).toBe('uz');
    expect(result.current.t('nav.journal')).toBe(translations.uz.nav.journal);
  });

  it('T1-F03-03: renders Uzbek dictionary headers and labels accurately', () => {
    localStorage.setItem('bochka_lang', 'uz');
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(Header, null)
      )
    );

    // Header renders translated brand name and language indicator in Uzbek
    expect(screen.getByText('Bochka Zdorovya')).toBeInTheDocument();
    expect(screen.getByText(translations.uz.app.subtitle)).toBeInTheDocument();
  });

  it('T1-F03-04: persists selected language preference to localStorage', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
      React.createElement(LanguageProvider, null, children);
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => {
      result.current.setLanguage('uz');
    });

    expect(localStorage.getItem('bochka_lang')).toBe('uz');
  });

  it('T1-F03-05: verifies reversible switching RU -> UZ -> RU across dictionary keys', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
      React.createElement(LanguageProvider, null, children);
    const { result } = renderHook(() => useTranslation(), { wrapper });

    // Initial RU
    expect(result.current.language).toBe('ru');
    expect(result.current.t('app.title')).toBe('Бочка Здоровья');

    // Switch to UZ
    act(() => {
      result.current.setLanguage('uz');
    });
    expect(result.current.language).toBe('uz');
    expect(result.current.t('app.title')).toBe('Bochka Zdorovya');

    // Revert to RU
    act(() => {
      result.current.setLanguage('ru');
    });
    expect(result.current.language).toBe('ru');
    expect(result.current.t('app.title')).toBe('Бочка Здоровья');
  });
});
