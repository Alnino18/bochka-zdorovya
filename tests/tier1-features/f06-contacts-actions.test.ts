import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../../src/components/layout/Header';
import { PriceListView } from '../../src/components/prices/PriceListView';
import App from '../../src/App';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { BUSINESS_CONTACTS } from '../../src/constants/catalogData';

describe('Tier 1 - Feature F06: Business Contacts & POS Decommissioning', () => {
  it('T1-F06-01: verifies authoritative business contacts data structure', () => {
    expect(BUSINESS_CONTACTS.phone).toBe('97 002-04-04');
    expect(BUSINESS_CONTACTS.phoneFormatted).toBe('+998 97 002-04-04');
    expect(BUSINESS_CONTACTS.phoneTel).toBe('tel:+998970020404');
    expect(BUSINESS_CONTACTS.instagram).toBe('@Bochka_zdorovya');
    expect(BUSINESS_CONTACTS.instagramUrl).toBe('https://instagram.com/Bochka_zdorovya');
  });

  it('T1-F06-02: verifies customer-facing phone dialer is decommissioned from Header', () => {
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(Header, null)
      )
    );

    const phoneLink = screen.queryByTestId('header-phone-link');
    expect(phoneLink).not.toBeInTheDocument();
  });

  it('T1-F06-03: verifies customer-facing Instagram link is decommissioned from Header', () => {
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(Header, null)
      )
    );

    const instaLink = screen.queryByTestId('header-instagram-link');
    expect(instaLink).not.toBeInTheDocument();
  });

  it('T1-F06-04: verifies business identity is preserved in catalog reference footer', () => {
    render(
      React.createElement(
        LanguageProvider,
        { defaultLanguage: 'ru' },
        React.createElement(PriceListView, null)
      )
    );

    const footer = screen.getByTestId('catalog-footer-info');
    expect(footer).toBeInTheDocument();
    expect(footer.textContent).toContain(BUSINESS_CONTACTS.nameRu);
  });

  it('T1-F06-05: verifies POS App shell renders no unvetted external navigation links', () => {
    const { container } = render(React.createElement(App, null));

    // Admin POS terminal should not contain external links targeting non-whitelisted domains
    const externalLinks = container.querySelectorAll('a[target="_blank"]');
    expect(externalLinks.length).toBe(0);
  });
});
