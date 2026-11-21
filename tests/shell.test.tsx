import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../src/components/layout/Header';
import { BottomNav } from '../src/components/layout/BottomNav';
import { OfflineBadge } from '../src/components/layout/OfflineBadge';
import { LanguageProvider } from '../src/context/LanguageContext';
import App from '../src/App';

describe('Application Shell Components', () => {
  describe('Header Component', () => {
    it('renders brand title and contact links for Phone and Instagram', () => {
      render(
        <LanguageProvider>
          <Header />
        </LanguageProvider>
      );

      // Title
      expect(screen.getAllByText('Бочка Здоровья')[0]).toBeInTheDocument();

      // Quick action links
      const phoneLink = screen.getByTestId('header-phone-link');
      expect(phoneLink).toHaveAttribute('href', 'tel:+998970020404');

      const instagramLink = screen.getByTestId('header-instagram-link');
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/Bochka_zdorovya');
      expect(instagramLink).toHaveAttribute('target', '_blank');

      // Language buttons
      expect(screen.getByTestId('lang-btn-ru')).toBeInTheDocument();
      expect(screen.getByTestId('lang-btn-uz')).toBeInTheDocument();
    });

    it('switches language between RU and UZ when buttons are clicked', () => {
      render(
        <LanguageProvider>
          <Header />
        </LanguageProvider>
      );

      const uzBtn = screen.getByTestId('lang-btn-uz');
      fireEvent.click(uzBtn);
      expect(screen.getByText('Bochka Zdorovya')).toBeInTheDocument();

      const ruBtn = screen.getByTestId('lang-btn-ru');
      fireEvent.click(ruBtn);
      expect(screen.getAllByText('Бочка Здоровья')[0]).toBeInTheDocument();
    });
  });

  describe('BottomNav Component', () => {
    it('renders all three mobile navigation tabs and triggers tab change', () => {
      const onTabChange = vi.fn();
      render(
        <LanguageProvider>
          <BottomNav activeTab="journal" onTabChange={onTabChange} />
        </LanguageProvider>
      );

      const journalBtn = screen.getByTestId('bottom-nav-journal');
      const priceListBtn = screen.getByTestId('bottom-nav-pricelist');
      const summaryBtn = screen.getByTestId('bottom-nav-summary');

      expect(journalBtn).toBeInTheDocument();
      expect(priceListBtn).toBeInTheDocument();
      expect(summaryBtn).toBeInTheDocument();

      fireEvent.click(priceListBtn);
      expect(onTabChange).toHaveBeenCalledWith('pricelist');

      fireEvent.click(summaryBtn);
      expect(onTabChange).toHaveBeenCalledWith('summary');
    });
  });

  describe('OfflineBadge Component', () => {
    it('does not render when online', () => {
      render(
        <LanguageProvider>
          <OfflineBadge forceOffline={false} />
        </LanguageProvider>
      );
      expect(screen.queryByTestId('offline-badge')).not.toBeInTheDocument();
    });

    it('renders warning message when offline', () => {
      render(
        <LanguageProvider>
          <OfflineBadge forceOffline={true} />
        </LanguageProvider>
      );
      const badge = screen.getByTestId('offline-badge');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toContain('Офлайн-режим');
    });
  });

  describe('App Shell Layout', () => {
    it('renders full App with sections and responds to tab switches', () => {
      render(<App />);

      expect(screen.getAllByText('Бочка Здоровья')[0]).toBeInTheDocument();
      expect(screen.getByTestId('section-journal')).toBeInTheDocument();

      // Switch to price list via bottom nav
      fireEvent.click(screen.getByTestId('bottom-nav-pricelist'));
      expect(screen.getByTestId('section-pricelist')).toBeInTheDocument();

      // Switch to summary via bottom nav
      fireEvent.click(screen.getByTestId('bottom-nav-summary'));
      expect(screen.getByTestId('section-summary')).toBeInTheDocument();
    });

    it('renders contact action buttons inside a flex-wrap container for responsive wrapping', () => {
      render(<App />);

      const actionsContainer = screen.getByTestId('contact-card-actions');
      expect(actionsContainer).toBeInTheDocument();
      expect(actionsContainer).toHaveClass('flex');
      expect(actionsContainer).toHaveClass('flex-wrap');

      const phoneLink = actionsContainer.querySelector('a[href="tel:+998970020404"]');
      expect(phoneLink).toBeInTheDocument();
    });
  });
});
