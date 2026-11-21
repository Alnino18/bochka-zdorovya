import { describe, it, expect } from 'vitest';
import { calculateDaySummary } from '../../src/utils/calculations';
import { DayRecord } from '../../src/types/accounting';

describe('Tier 1 - Feature F08: Financial Accounting Engine (R3)', () => {
  const sampleRecord: DayRecord = {
    id: 'journal-test-f08',
    date: '2026-11-21',
    dateFormatted: '21.11.2026',
    masters: [
      { id: 'm1', name: 'Иро', nameUz: 'Iro', clientCount: 4, revenue: 1280000, payout: 400000, salonShare: 880000 },
      { id: 'm2', name: 'Мах', nameUz: 'Max', clientCount: 2, revenue: 640000, payout: 200000, salonShare: 440000 },
      { id: 'm3', name: 'Комила', nameUz: 'Komila', clientCount: 2, revenue: 640000, payout: 200000, salonShare: 440000 },
    ],
    expenses: { cleaning: 200000, other: 0 },
    bar: { revenue: 440000, items: [] },
    bookings: [],
  };

  it('T1-F08-01: calculates Gross Service Revenue as exact sum of master revenues in production engine', () => {
    const summary = calculateDaySummary(sampleRecord);
    expect(summary.grossServiceRevenue).toBe(1280000 + 640000 + 640000);
    expect(summary.grossServiceRevenue).toBe(2560000);
  });

  it('T1-F08-02: calculates Gross Total Revenue as Gross Service Revenue + Bar Sales', () => {
    const summary = calculateDaySummary(sampleRecord);
    expect(summary.grossTotalRevenue).toBe(2560000 + 440000);
    expect(summary.grossTotalRevenue).toBe(3000000);
  });

  it('T1-F08-03: calculates Net Cash Balance as Revenue + Bar - Cleaning', () => {
    const summary = calculateDaySummary(sampleRecord);
    expect(summary.netBalance).toBe(3000000 - 200000);
    expect(summary.netBalance).toBe(2800000);
  });

  it('T1-F08-04: calculates Net Salon Profit as Net Balance - Total Master Payouts', () => {
    const summary = calculateDaySummary(sampleRecord);
    expect(summary.totalMasterPayouts).toBe(400000 + 200000 + 200000);
    expect(summary.totalMasterPayouts).toBe(800000);
    expect(summary.netSalonProfit).toBe(2800000 - 800000);
    expect(summary.netSalonProfit).toBe(2000000);
  });

  it('T1-F08-05: verifies reactive update when bar sales or cleaning expenses change', () => {
    const modifiedRecord: DayRecord = {
      ...sampleRecord,
      bar: { revenue: 500000, items: [] }, // +60,000 UZS
      expenses: { cleaning: 250000, other: 0 }, // +50,000 UZS
    };

    const summary = calculateDaySummary(modifiedRecord);
    expect(summary.barRevenue).toBe(500000);
    expect(summary.grossTotalRevenue).toBe(3060000);
    expect(summary.netBalance).toBe(3060000 - 250000);
    expect(summary.netBalance).toBe(2810000);
    expect(summary.netSalonProfit).toBe(2810000 - 800000);
    expect(summary.netSalonProfit).toBe(2010000);
  });
});
