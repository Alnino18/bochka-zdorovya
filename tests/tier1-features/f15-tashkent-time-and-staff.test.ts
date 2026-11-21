import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import {
  getTashkentTodayDate,
  getTashkentTimeString,
  formatTashkentDateDisplay,
  getTashkentLiveHeaderString,
} from '../../src/utils/date';
import {
  StoreProvider,
  useStore,
  STAFF_STORAGE_KEY,
} from '../../src/context/StoreContext';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(StoreProvider, null, children);

describe('Feature: Tashkent Timezone (Asia/Tashkent, UTC+5) & Persistent Staff Registry', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Tashkent Timezone Utilities (Asia/Tashkent)', () => {
    it('T-TIME-01: getTashkentTodayDate returns strictly YYYY-MM-DD formatted date in Asia/Tashkent', () => {
      const today = getTashkentTodayDate();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify with arbitrary UTC date crossing midnight in Tashkent
      // E.g., 2026-11-21 19:30:00 UTC is 2026-11-22 00:30:00 in Tashkent (UTC+5)
      const lateUtc = new Date('2026-11-21T19:30:00Z');
      expect(getTashkentTodayDate(lateUtc)).toBe('2026-11-22');

      // 2026-11-21 18:59:00 UTC is 2026-11-21 23:59:00 in Tashkent (UTC+5)
      const earlyUtc = new Date('2026-11-21T18:59:00Z');
      expect(getTashkentTodayDate(earlyUtc)).toBe('2026-11-21');
    });

    it('T-TIME-02: getTashkentTimeString formats 24h clock with or without seconds in Asia/Tashkent', () => {
      const timeWithSec = getTashkentTimeString(new Date('2026-11-21T19:30:45Z'), true);
      expect(timeWithSec).toBe('00:30:45');

      const timeWithoutSec = getTashkentTimeString(new Date('2026-11-21T19:30:45Z'), false);
      expect(timeWithoutSec).toBe('00:30');
    });

    it('T-TIME-03: formatTashkentDateDisplay formats bilingual dates', () => {
      const testDate = new Date('2026-11-21T19:30:00Z'); // 22 Nov in Tashkent
      const ruDisplay = formatTashkentDateDisplay(testDate, 'ru');
      expect(ruDisplay.toLowerCase()).toContain('22');
      expect(ruDisplay.toLowerCase()).toContain('ноябр');

      const uzDisplay = formatTashkentDateDisplay(testDate, 'uz');
      expect(uzDisplay).toContain('22-ноябр');
    });

    it('T-TIME-04: getTashkentLiveHeaderString generates header badge content', () => {
      const testDate = new Date('2026-11-21T19:30:00Z');
      const headerStrUz = getTashkentLiveHeaderString(testDate, 'uz');
      expect(headerStrUz).toContain('Тошкент вақти');
      expect(headerStrUz).toContain('00:30:00');

      const headerStrRu = getTashkentLiveHeaderString(testDate, 'ru');
      expect(headerStrRu).toContain('Время в Ташкенте');
      expect(headerStrRu).toContain('00:30:00');
    });
  });

  describe('2. Persistent Salon Staff Registry (Massajistkas)', () => {
    it('T-STAFF-01: default massajistkas (Иро, Мах, Комила) are registered on boot', () => {
      const { result } = renderHook(() => useStore(), { wrapper });
      expect(result.current.staff).toHaveLength(3);
      const names = result.current.staff.map((s) => s.name);
      expect(names).toContain('Иро');
      expect(names).toContain('Мах');
      expect(names).toContain('Комила');
    });

    it('T-STAFF-02: any new day viewed or created ALREADY contains the registered massajistkas ready for orders', () => {
      const { result } = renderHook(() => useStore(), { wrapper });
      const futureDate = '2026-11-25';

      act(() => {
        result.current.setSelectedDate(futureDate);
      });

      const dayRecord = result.current.currentRecord;
      expect(dayRecord.date).toBe(futureDate);
      expect(dayRecord.masters.length).toBeGreaterThanOrEqual(3);

      const masterNames = dayRecord.masters.map((m) => m.name);
      expect(masterNames).toContain('Иро');
      expect(masterNames).toContain('Мах');
      expect(masterNames).toContain('Комила');

      // Verify all start with 0 clients and 0 revenue
      dayRecord.masters.forEach((m) => {
        expect(m.clientCount).toBe(0);
        expect(m.revenue).toBe(0);
        expect(m.orders).toEqual([]);
      });
    });

    it('T-STAFF-03: adding a new massajistka persists her to localStorage and salon roster for all future days', () => {
      const { result } = renderHook(() => useStore(), { wrapper });

      act(() => {
        result.current.addMaster('2026-11-22', { name: 'Шахзода', nameUz: 'Shahzoda' });
      });

      // Present on current day
      const todayRecord = result.current.getRecordByDate('2026-11-22');
      expect(todayRecord?.masters.some((m) => m.name === 'Шахзода')).toBe(true);

      // Present in permanent staff roster
      expect(result.current.staff.some((s) => s.name === 'Шахзода')).toBe(true);

      // Persisted in localStorage
      const savedStaff = JSON.parse(localStorage.getItem(STAFF_STORAGE_KEY) || '[]');
      expect(savedStaff.some((s: any) => s.name === 'Шахзода')).toBe(true);

      // Automatically present on tomorrow/future day without manual re-adding!
      act(() => {
        result.current.setSelectedDate('2026-11-26');
      });
      const futureRecord = result.current.currentRecord;
      expect(futureRecord.masters.some((m) => m.name === 'Шахзода')).toBe(true);
    });

    it('T-STAFF-04: orders can be immediately assigned to persistent massajistkas on any new day', () => {
      const { result } = renderHook(() => useStore(), { wrapper });
      const testDate = '2026-11-27';

      act(() => {
        result.current.setSelectedDate(testDate);
      });

      const iro = result.current.currentRecord.masters.find((m) => m.name === 'Иро')!;
      expect(iro).toBeDefined();

      act(() => {
        result.current.addOrder(testDate, iro.id, {
          serviceName: 'Оздоровительный массаж',
          durationMinutes: 40,
          price: 300000,
        });
      });

      const updatedRecord = result.current.getRecordByDate(testDate)!;
      const updatedIro = updatedRecord.masters.find((m) => m.name === 'Иро')!;
      expect(updatedIro.clientCount).toBe(1);
      expect(updatedIro.revenue).toBe(300000);
      expect(updatedIro.payout).toBe(100000);
      expect(updatedIro.salonShare).toBe(200000);
    });
  });

  describe('3. App Start Date Initialization', () => {
    it('T-DATE-01: default selectedDate is initialized to Tashkent today date', () => {
      const { result } = renderHook(() => useStore(), { wrapper });
      expect(result.current.selectedDate).toBe(getTashkentTodayDate());
    });
  });

  describe('4. Ultra-Modern POS UI: Live Tashkent Clock, Glowing Buttons, & Massajistka Cards', () => {
    it('T-UI-01: renders prominent live Tashkent digital clock badge in Header and App hero', () => {
      render(React.createElement(App, { initialDate: '2026-11-19' }));

      const headerClock = screen.getByTestId('tashkent-live-clock');
      expect(headerClock).toBeInTheDocument();
      expect(headerClock.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);

      const appClock = screen.getByTestId('app-tashkent-clock-badge');
      expect(appClock).toBeInTheDocument();
      expect(appClock.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('T-UI-02: renders prominent quick buttons: Telegram, Price List, and Massajistkalar', () => {
      render(React.createElement(App, { initialDate: '2026-11-19' }));

      // Telegram button
      const tgBtn = screen.getByTestId('send-telegram-btn');
      expect(tgBtn).toBeInTheDocument();

      // Price List quick button
      const priceBtn = screen.getByTestId('open-price-editor-btn');
      expect(priceBtn).toBeInTheDocument();
      fireEvent.click(priceBtn);
      expect(screen.getByTestId('price-editor-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('close-price-editor-btn'));
      expect(screen.queryByTestId('price-editor-modal')).toBeNull();

      // Quick massajistkas button
      const massajistkasBtn = screen.getByTestId('quick-massajistkas-btn');
      expect(massajistkasBtn).toBeInTheDocument();
      fireEvent.click(massajistkasBtn);
      expect(screen.getByTestId('add-master-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('cancel-master-btn'));
      expect(screen.queryByTestId('add-master-modal')).toBeNull();
    });

    it('T-UI-03: renders massajistka cards with avatar, client counter badge, and total revenue', () => {
      render(React.createElement(App, { initialDate: '2026-11-19' }));

      // Check Iro on Nov 19: 2 clients, 470 000 revenue
      const iroRevenue = screen.getByTestId('pos-masseur-chip-revenue-m-iro-19');
      expect(iroRevenue).toBeInTheDocument();
      expect(iroRevenue).toHaveTextContent('470 000');

      const iroClients = screen.getByTestId('pos-masseur-chip-clients-m-iro-19');
      expect(iroClients).toBeInTheDocument();
      expect(iroClients).toHaveTextContent('2 кл');
    });
  });
});
