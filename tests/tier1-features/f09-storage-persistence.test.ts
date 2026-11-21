import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { StoreProvider, useStore, STORAGE_KEY } from '../../src/context/StoreContext';
import { BASELINE_NOV_19, BASELINE_NOV_20 } from '../../src/constants/baselineData';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(StoreProvider, null, children);

describe('Tier 1 - Feature F09: Local Storage Persistence (R3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-F09-01: serializes store modifications into localStorage as valid JSON automatically', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.updateExpenses('2026-11-19', { cleaning: 250000 });
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    const nov19 = parsed.find((r: any) => r.date === '2026-11-19');
    expect(nov19.expenses.cleaning).toBe(250000);
  });

  it('T1-F09-02: rehydrates store records accurately from stored JSON on mount', () => {
    const customData = [
      {
        ...BASELINE_NOV_19,
        notes: 'Pre-seeded storage rehydration test note',
      },
      BASELINE_NOV_20,
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customData));

    const { result } = renderHook(() => useStore(), { wrapper });

    expect(result.current.records).toHaveLength(2);
    expect(result.current.getRecordByDate('2026-11-19')?.notes).toBe(
      'Pre-seeded storage rehydration test note'
    );
  });

  it('T1-F09-03: exportData generates valid JSON backup format with application metadata', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    const exportString = result.current.exportData();
    expect(typeof exportString).toBe('string');

    const parsed = JSON.parse(exportString);
    expect(parsed.app).toBe('Бочка Здоровья');
    expect(parsed.version).toBe('1.0.0');
    expect(Array.isArray(parsed.records)).toBe(true);
    expect(parsed.records).toHaveLength(2);
  });

  it('T1-F09-04: importData updates store state and storage from valid JSON backup', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    const importPayload = {
      app: 'Бочка Здоровья',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      records: [
        {
          ...BASELINE_NOV_19,
          notes: 'Imported test audit note',
        },
      ],
    };

    let success = false;
    act(() => {
      success = result.current.importData(JSON.stringify(importPayload));
    });

    expect(success).toBe(true);
    expect(result.current.getRecordByDate('2026-11-19')?.notes).toBe('Imported test audit note');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored[0].notes).toBe('Imported test audit note');
  });

  it('T1-F09-05: resetToBaseline replaces modified storage with canonical baseline records', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.updateExpenses('2026-11-19', { cleaning: 999999 });
      result.current.addMaster('2026-11-19', { name: 'Temporary Master' });
    });

    act(() => {
      result.current.resetToBaseline();
    });

    expect(result.current.records).toHaveLength(2);
    const restoredNov19 = result.current.getRecordByDate('2026-11-19')!;
    expect(restoredNov19.expenses.cleaning).toBe(200000);
    expect(restoredNov19.masters.some(m => m.name === 'Temporary Master')).toBe(false);
  });
});
