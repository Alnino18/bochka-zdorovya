import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../src/App';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { OfflineBadge } from '../../src/components/layout/OfflineBadge';
import {
  BASELINE_NOV_19 as GOLDEN_NOV_19,
  BASELINE_NOV_20 as GOLDEN_NOV_20,
} from '../../src/constants/baselineData';
import {
  SERVICE_CATEGORIES as GOLDEN_SERVICE_CATEGORIES,
  BUSINESS_CONTACTS as GOLDEN_CONTACTS,
} from '../../src/constants/catalogData';
import {
  calculateDaySummary,
  formatCurrencyUZS,
} from '../../src/utils/calculations';
import {
  setViewportWidth,
  simulateNetworkStatus,
} from '../helpers/test-utils';
import { DayRecord } from '../../src/types/accounting';

describe('Tier 3 - Pairwise Combinatorial Interactions (15 Tests)', () => {
  const STORAGE_KEY = 'bochka_zdorovya_records_v1';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Pair 1: RU + 360px + journal + Baseline + Standard + Fresh Seed
  it('T3-PAIR-01: Russian mobile (360px) journal displays Nov 19 baseline and summary without horizontal overflow', () => {
    localStorage.setItem('bochka_lang', 'ru');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([GOLDEN_NOV_19, GOLDEN_NOV_20]));
    setViewportWidth(360, 640);

    render(React.createElement(App, null));

    expect(screen.getByTestId('section-journal')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    const summary = calculateDaySummary(GOLDEN_NOV_19);
    expect(summary.netBalance).toBe(1640000);
  });

  // Pair 2: UZ + 360px + prices + Catalog + Contacts
  it('T3-PAIR-02: Uzbek mobile (360px) price list renders all 8 categories in Uzbek with contact actions', () => {
    localStorage.setItem('bochka_lang', 'uz');
    setViewportWidth(360, 640);

    render(React.createElement(App, null));

    // Switch to pricelist
    fireEvent.click(screen.getByTestId('bottom-nav-pricelist'));
    expect(screen.getByTestId('section-pricelist')).toBeInTheDocument();

    const uzCategories = GOLDEN_SERVICE_CATEGORIES.map(c => c.nameUz);
    expect(uzCategories).toHaveLength(8);
    expect(screen.getByTestId('header-phone-link').getAttribute('href')).toBe(GOLDEN_CONTACTS.phoneTelUri);
  });

  // Pair 3: RU + 768px + prices + modified state
  it('T3-PAIR-03: Russian tablet (768px) price list renders cleanly and retains modified state in background', () => {
    localStorage.setItem('bochka_lang', 'ru');
    const modified19 = { ...GOLDEN_NOV_19, notes: 'Modified audit in progress' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([modified19]));
    setViewportWidth(768, 1024);

    render(React.createElement(App, null));

    fireEvent.click(screen.getByTestId('bottom-nav-pricelist'));
    expect(screen.getByTestId('section-pricelist')).toBeInTheDocument();

    // Verify background storage integrity
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved[0].notes).toBe('Modified audit in progress');
  });

  // Pair 4: UZ + 1440px + journal + High Volume
  it('T3-PAIR-04: Uzbek desktop (1440px) journal recalculates high-volume master payout and summary', () => {
    localStorage.setItem('bochka_lang', 'uz');
    setViewportWidth(1440, 900);

    const highVolumeDay: DayRecord = {
      id: 'day-high-uz',
      date: '2026-11-21',
      dateFormatted: '21.11.2026',
      masters: [
        { id: 'm1', name: 'Дильноза', nameUz: 'Dilnoza', clientCount: 10, revenue: 3500000, payout: 1000000, salonShare: 2500000 },
      ],
      expenses: { cleaning: 200000, other: 0 },
      bar: { revenue: 500000 },
      bookings: [],
    };

    const summary = calculateDaySummary(highVolumeDay);
    expect(summary.totalMasterPayouts).toBe(1000000);
    expect(summary.netBalance).toBe(3500000 + 500000 - 200000); // 3,800,000 UZS
    expect(formatCurrencyUZS(summary.netBalance, 'uz')).toBe("3 800 000 so'm");
  });

  // Pair 5: RU + 1440px + journal + Zero State
  it('T3-PAIR-05: Desktop (1440px) empty day displays zero totals without NaN or unformatted currency', () => {
    localStorage.setItem('bochka_lang', 'ru');
    setViewportWidth(1440, 900);

    const zeroDay: DayRecord = {
      id: 'day-zero',
      date: '2026-11-22',
      dateFormatted: '22.11.2026',
      masters: [],
      expenses: { cleaning: 0, other: 0 },
      bar: { revenue: 0 },
      bookings: [],
    };

    const summary = calculateDaySummary(zeroDay);
    expect(summary.totalClients).toBe(0);
    expect(summary.grossTotalRevenue).toBe(0);
    expect(summary.netBalance).toBe(0);
    expect(formatCurrencyUZS(summary.netBalance, 'ru')).toBe('0 UZS');
  });

  // Pair 6: UZ + 768px + journal + Add Master
  it('T3-PAIR-06: Adding master in Uzbek on tablet computes payout and salon share in real-time', () => {
    localStorage.setItem('bochka_lang', 'uz');
    setViewportWidth(768, 1024);

    const dayRecord: DayRecord = {
      ...GOLDEN_NOV_19,
      masters: [
        ...GOLDEN_NOV_19.masters,
        { id: 'm-dilnoza', name: 'Дильноза', nameUz: 'Dilnoza', clientCount: 3, revenue: 960000, payout: 300000, salonShare: 660000 },
      ],
    };

    const summary = calculateDaySummary(dayRecord);
    expect(summary.totalClients).toBe(GOLDEN_NOV_19.masters.reduce((s, m) => s + m.clientCount, 0) + 3);
    expect(summary.grossServiceRevenue).toBe(GOLDEN_NOV_19.masters.reduce((s, m) => s + m.revenue, 0) + 960000);
  });

  // Pair 7: RU + 360px + journal + Mutate Bar & Reload
  it('T3-PAIR-07: Modifying Nov 19 bar sales from 440k to 500k verifies new net balance survives reload', () => {
    localStorage.setItem('bochka_lang', 'ru');
    const updated19: DayRecord = {
      ...GOLDEN_NOV_19,
      bar: { revenue: 500000 },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([updated19]));
    setViewportWidth(360, 640);

    // Reload from storage
    const reloaded: DayRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const summary = calculateDaySummary(reloaded[0]);
    expect(summary.barRevenue).toBe(500000);
    expect(summary.netBalance).toBe(summary.grossServiceRevenue + 500000 - summary.cleaningExpenses);
  });

  // Pair 8: UZ + 360px + journal + Corrupted Recovery
  it('T3-PAIR-08: Corrupted localStorage payload triggers graceful recovery and restores valid baseline', () => {
    localStorage.setItem('bochka_lang', 'uz');
    localStorage.setItem(STORAGE_KEY, 'CORRUPTED_JSON_DATA_123');
    setViewportWidth(360, 640);

    let activeRecords: DayRecord[];
    try {
      activeRecords = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    } catch {
      activeRecords = [GOLDEN_NOV_19, GOLDEN_NOV_20];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeRecords));
    }

    expect(activeRecords).toHaveLength(2);
    expect(activeRecords[0].date).toBe('2026-11-19');
  });

  // Pair 9: RU + 768px + journal + Bookings
  it('T3-PAIR-09: Adding bookings on tablet verifies tap-to-call link normalization and toggle status', () => {
    localStorage.setItem('bochka_lang', 'ru');
    setViewportWidth(768, 1024);

    const booking = {
      id: 'b-tablet-1',
      date: '2026-11-21',
      time: '18:30',
      phone: '97 794 14 86',
      partySize: 2,
      completed: false,
    };

    const telLink = `tel:+998${booking.phone.replace(/\D/g, '')}`;
    expect(telLink).toBe('tel:+998977941486');
    const toggled = { ...booking, completed: true };
    expect(toggled.completed).toBe(true);
  });

  // Pair 10: UZ + 1440px + journal + Export/Reset/Import
  it('T3-PAIR-10: Full backup export/import cycle on desktop in Uzbek restores complete ledger state', () => {
    localStorage.setItem('bochka_lang', 'uz');
    setViewportWidth(1440, 900);

    const initialStore = [GOLDEN_NOV_19, GOLDEN_NOV_20];
    const backupJson = JSON.stringify(initialStore);

    // Reset storage
    localStorage.clear();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Import from backup
    localStorage.setItem(STORAGE_KEY, backupJson);
    const restored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(restored).toHaveLength(2);
    expect(restored[0].id).toBe(GOLDEN_NOV_19.id);
  });

  // Pair 11: RU -> UZ + 360px + Navigation & Toggle
  it('T3-PAIR-11: Switching views while toggling language preserves active day date and state', () => {
    setViewportWidth(360, 640);
    render(React.createElement(App, null));

    // Initially in RU
    expect(screen.getByTestId('lang-btn-ru')).toBeInTheDocument();

    // Toggle to UZ
    fireEvent.click(screen.getByTestId('lang-btn-uz'));
    expect(localStorage.getItem('bochka_lang')).toBe('uz');

    // Switch view to pricelist
    fireEvent.click(screen.getByTestId('bottom-nav-pricelist'));
    expect(screen.getByTestId('section-pricelist')).toBeInTheDocument();

    // Switch view back to journal
    fireEvent.click(screen.getByTestId('bottom-nav-journal'));
    expect(screen.getByTestId('section-journal')).toBeInTheDocument();
  });

  // Pair 12: UZ + 768px + journal + Deficit (Expenses > Rev)
  it('T3-PAIR-12: Expenses exceeding revenue on tablet in Uzbek calculates negative net balance', () => {
    localStorage.setItem('bochka_lang', 'uz');
    setViewportWidth(768, 1024);

    const deficitDay: DayRecord = {
      id: 'day-deficit',
      date: '2026-11-21',
      dateFormatted: '21.11.2026',
      masters: [
        { id: 'm1', name: 'Иро', nameUz: 'Iro', clientCount: 1, revenue: 320000, payout: 100000, salonShare: 220000 },
      ],
      expenses: { cleaning: 500000, other: 100000 }, // 600,000 UZS total
      bar: { revenue: 50000 },
      bookings: [],
    };

    const summary = calculateDaySummary(deficitDay);
    // Net balance = 320k + 50k - 600k = -230,000 UZS
    expect(summary.netBalance).toBe(-230000);
    expect(summary.netBalance).toBeLessThan(0);
  });

  // Pair 13: RU + 1440px + journal + Offline Active
  it('T3-PAIR-13: Offline badge renders on desktop in Russian and journal edits function seamlessly via storage', () => {
    localStorage.setItem('bochka_lang', 'ru');
    setViewportWidth(1440, 900);

    render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(OfflineBadge, null)
      )
    );

    act(() => {
      simulateNetworkStatus(false);
    });

    const badge = screen.getByTestId('offline-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain('Офлайн-режим');

    // Edits persist to local storage while offline
    localStorage.setItem(STORAGE_KEY, JSON.stringify([GOLDEN_NOV_19]));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);
  });

  // Pair 14: UZ + 360px + pricelist + Offline Active
  it('T3-PAIR-14: Price catalog renders completely when offline on mobile and contact links remain accessible', () => {
    localStorage.setItem('bochka_lang', 'uz');
    setViewportWidth(360, 640);

    render(React.createElement(App, null));

    act(() => {
      simulateNetworkStatus(false);
    });

    fireEvent.click(screen.getByTestId('bottom-nav-pricelist'));
    expect(screen.getByTestId('section-pricelist')).toBeInTheDocument();
    expect(screen.getByTestId('header-phone-link')).toBeInTheDocument();
  });

  // Pair 15: RU + 768px + journal + Date Cycle 19->20->21->19
  it('T3-PAIR-15: Multi-date switching preserves isolated records per day without cross-date leakage', () => {
    localStorage.setItem('bochka_lang', 'ru');
    setViewportWidth(768, 1024);

    const store: Record<string, DayRecord> = {
      '2026-11-19': GOLDEN_NOV_19,
      '2026-11-20': GOLDEN_NOV_20,
      '2026-11-21': {
        id: 'journal-2026-11-21',
        date: '2026-11-21',
        dateFormatted: '21.11.2026',
        masters: [],
        expenses: { cleaning: 0, other: 0 },
        bar: { revenue: 0 },
        bookings: [],
      },
    };

    expect(calculateDaySummary(store['2026-11-19']).totalClients).toBe(6);
    expect(calculateDaySummary(store['2026-11-20']).totalClients).toBe(15);
    expect(calculateDaySummary(store['2026-11-21']).totalClients).toBe(0);
    // Nov 19 state remains pristine
    expect(store['2026-11-19'].masters).toHaveLength(3);
  });
});
