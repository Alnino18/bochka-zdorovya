import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { formatCurrencyUZS, calculateDaySummary } from '../../src/utils/calculations';
import { StoreProvider, useStore } from '../../src/context/StoreContext';
import { DayRecord } from '../../src/types/accounting';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(StoreProvider, null, children);

describe('Tier 1 - Feature F11: Facility Expenses & Bar Sales (R3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-F11-01: updates cleaning expense in store and reflects change in net cash balance', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.setSelectedDate('2026-11-19');
    });

    const initialNetBalance = result.current.summary.netBalance;

    // Update cleaning from 200,000 to 250,000 UZS (+50,000 UZS expense)
    act(() => {
      result.current.updateExpenses('2026-11-19', { cleaning: 250000 });
    });

    expect(result.current.summary.cleaningExpenses).toBe(250000);
    expect(result.current.summary.netBalance).toBe(initialNetBalance - 50000);
  });

  it('T1-F11-02: logs additional petty expenses and adds to total facility expenses in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.setSelectedDate('2026-11-19');
    });

    const initialTotalExpenses = result.current.summary.totalExpenses;

    act(() => {
      result.current.updateExpenses('2026-11-19', { other: 50000, description: 'Прачечная / Laundry' });
    });

    expect(result.current.summary.cleaningExpenses).toBe(200000);
    expect(result.current.summary.totalExpenses).toBe(initialTotalExpenses + 50000);
  });

  it('T1-F11-03: adds bar sales revenue to gross total revenue and cash desk balance in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.setSelectedDate('2026-11-20');
    });

    const initialGrossTotal = result.current.summary.grossTotalRevenue;
    const initialNetBalance = result.current.summary.netBalance;

    // Change bar revenue from 440,000 to 500,000 UZS (+60,000 UZS)
    act(() => {
      result.current.updateBar('2026-11-20', { revenue: 500000 });
    });

    expect(result.current.summary.barRevenue).toBe(500000);
    expect(result.current.summary.grossTotalRevenue).toBe(initialGrossTotal + 60000);
    expect(result.current.summary.netBalance).toBe(initialNetBalance + 60000);
  });

  it('T1-F11-04: aggregates itemized bar sales matching Nov 19 ledger (50k + 10k + 80k + 300k = 440k) in calculations engine', () => {
    const recordWithBarItems: DayRecord = {
      id: 'day-bar-items',
      date: '2026-11-20',
      dateFormatted: '20.11.2026',
      masters: [],
      expenses: { cleaning: 0, other: 0 },
      bar: {
        revenue: 440000,
        items: [
          { name: 'Бар 1', price: 50000 },
          { name: 'Бар 2', price: 10000 },
          { name: 'Бар 3', price: 80000 },
          { name: 'Бар 4', price: 300000 },
        ],
      },
      bookings: [],
    };

    const aggregated = recordWithBarItems.bar.items!.reduce((sum, item) => sum + item.price, 0);
    expect(aggregated).toBe(recordWithBarItems.bar.revenue);

    const summary = calculateDaySummary(recordWithBarItems);
    expect(summary.barRevenue).toBe(440000);
    expect(summary.grossTotalRevenue).toBe(440000);
  });

  it('T1-F11-05: formats currency amounts with correct thousands separator in RU and UZ using production formatter', () => {
    const amount = 440000;
    expect(formatCurrencyUZS(amount, 'ru')).toBe('440 000 UZS');
    expect(formatCurrencyUZS(amount, 'uz')).toBe("440 000 so'm");
  });
});
