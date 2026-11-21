import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../../src/components/layout/Header';
import App from '../../src/App';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { BUSINESS_CONTACTS } from '../../src/constants/catalogData';

describe('Tier 1 - Feature F06: Business Contacts & Actions (R2)', () => {
  it('T1-F06-01: displays phone contact information in Header', () => {
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(Header, null)
      )
    );

    const phoneLink = screen.getByTestId('header-phone-link');
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink.getAttribute('title')).toContain(BUSINESS_CONTACTS.phoneDisplay);
  });

  it('T1-F06-02: verifies phone action link has correct tel: protocol URI', () => {
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(Header, null)
      )
    );

    const phoneLink = screen.getByTestId('header-phone-link');
    expect(phoneLink.getAttribute('href')).toMatch(/^tel:(\+?998)?970020404$/);
  });

  it('T1-F06-03: displays Instagram handle and button title', () => {
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(Header, null)
      )
    );

    const instaLink = screen.getByTestId('header-instagram-link');
    expect(instaLink).toBeInTheDocument();
    expect(instaLink.getAttribute('title')).toContain(BUSINESS_CONTACTS.instagramHandle);
  });

  it('T1-F06-04: verifies Instagram link targets the official business profile in new tab', () => {
    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(Header, null)
      )
    );

    const instaLink = screen.getByTestId('header-instagram-link');
    expect(instaLink.getAttribute('href')).toBe(BUSINESS_CONTACTS.instagramUrl);
    expect(instaLink.getAttribute('target')).toBe('_blank');
  });

  it('T1-F06-05: verifies security attributes (rel="noopener noreferrer") on external links', () => {
    render(React.createElement(App, null));

    const instaLink = screen.getByTestId('header-instagram-link');
    expect(instaLink.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
