import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import {
  BASELINE_NOV_19,
  BASELINE_NOV_19_SUMMARY,
  BASELINE_NOV_20,
  BASELINE_NOV_20_SUMMARY,
  INITIAL_BASELINE_RECORDS,
} from '../../src/constants/baselineData';
import { calculateDaySummary } from '../../src/utils/calculations';
import { StoreProvider, useStore, STORAGE_KEY } from '../../src/context/StoreContext';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(StoreProvider, null, children);

describe('Tier 1 - Feature F07: Baseline Accounting Seeding (R3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-F07-01: verifies baseline dates 2026-11-19 and 2026-11-20 are structurally valid DayRecords in production', () => {
    expect(BASELINE_NOV_19.date).toBe('2026-11-19');
    expect(BASELINE_NOV_20.date).toBe('2026-11-20');
    expect(Array.isArray(BASELINE_NOV_19.masters)).toBe(true);
    expect(Array.isArray(BASELINE_NOV_20.masters)).toBe(true);
    expect(INITIAL_BASELINE_RECORDS).toHaveLength(2);
  });

  it('T1-F07-02: verifies Nov 19 baseline contains masters Iro, Max, and Komila', () => {
    const masterNames = BASELINE_NOV_19.masters.map(m => m.name);
    expect(masterNames).toContain('Иро');
    expect(masterNames).toContain('Мах');
    expect(masterNames).toContain('Комила');

    const totalClients = BASELINE_NOV_19.masters.reduce((sum, m) => sum + m.clientCount, 0);
    expect(totalClients).toBe(BASELINE_NOV_19_SUMMARY.totalClients);
  });

  it('T1-F07-03: verifies Nov 19 expenses and net balance match ledger math using production calculation engine', () => {
    expect(BASELINE_NOV_19.expenses.cleaning).toBe(200000);
    const summary = calculateDaySummary(BASELINE_NOV_19);
    expect(summary.netBalance).toBe(BASELINE_NOV_19_SUMMARY.netBalance);
    expect(summary.netSalonProfit).toBe(BASELINE_NOV_19_SUMMARY.netSalonProfit);
  });

  it('T1-F07-04: verifies Nov 20 baseline records bar sales (440k) and client bookings', () => {
    expect(BASELINE_NOV_20.bar.revenue).toBe(440000);
    expect(BASELINE_NOV_20.expenses.cleaning).toBe(200000);
    expect(BASELINE_NOV_20.bookings.length).toBeGreaterThanOrEqual(1);

    const summary = calculateDaySummary(BASELINE_NOV_20);
    expect(summary.totalClients).toBe(BASELINE_NOV_20_SUMMARY.totalClients);
    expect(summary.grossServiceRevenue).toBe(BASELINE_NOV_20_SUMMARY.grossServiceRevenue);
    expect(summary.grossTotalRevenue).toBe(BASELINE_NOV_20_SUMMARY.grossTotalRevenue);
    expect(summary.netBalance).toBe(BASELINE_NOV_20_SUMMARY.netBalance);
    expect(summary.netSalonProfit).toBe(BASELINE_NOV_20_SUMMARY.netSalonProfit);
  });

  it('T1-F07-05: verifies StoreContext boots and rehydrates initial baseline records idempotently', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    expect(result.current.records).toHaveLength(2);
    expect(result.current.getRecordByDate('2026-11-19')).toBeDefined();
    expect(result.current.getRecordByDate('2026-11-20')).toBeDefined();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored).toHaveLength(2);
  });
});
