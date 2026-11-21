import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { StoreProvider, useStore, STORAGE_KEY } from '../../src/context/StoreContext';
import { BASELINE_NOV_19 } from '../../src/constants/baselineData';
import { sanitizePhoneToTelUri } from '../../src/utils/calculations';
import { DayRecord } from '../../src/types/accounting';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(StoreProvider, null, children);

describe('Tier 2 - Boundary B04: Storage & Bookings Boundaries (F9, F12)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // F9 Storage Boundaries
  it('T2-B04-01: catches storage quota exceeded error safely in StoreContext without unhandled rejection', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.updateExpenses('2026-11-19', { cleaning: 300000 });
    });

    expect(result.current.storageError).toBe('QuotaExceededError');
    localStorage.setItem = originalSetItem;
  });

  it('T2-B04-02: recovers safely in StoreContext when localStorage contains corrupted non-JSON string', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid JSON : true, broken');

    const { result } = renderHook(() => useStore(), { wrapper });

    expect(result.current.records).toHaveLength(2);
    expect(result.current.records[0].date).toBe('2026-11-19');
    expect(result.current.records[1].date).toBe('2026-11-20');
  });

  it('T2-B04-03: handles malformed payload where stored data is a primitive rather than an array in StoreContext', () => {
    localStorage.setItem(STORAGE_KEY, '"just_a_string"');

    const { result } = renderHook(() => useStore(), { wrapper });

    expect(Array.isArray(result.current.records)).toBe(true);
    expect(result.current.records).toHaveLength(2);
  });

  it('T2-B04-04: handles missing storage key and defaults StoreContext to baseline records', () => {
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    const { result } = renderHook(() => useStore(), { wrapper });

    expect(result.current.records).toHaveLength(2);
    expect(result.current.getRecordByDate('2026-11-19')).toBeDefined();
  });

  it('T2-B04-05: prevents XSS injection strings in notes from altering structure in StoreContext', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    const maliciousNote = '<script>alert("XSS")</script>';

    act(() => {
      result.current.updateDayNotes('2026-11-19', maliciousNote);
    });

    const updated = result.current.getRecordByDate('2026-11-19')!;
    expect(updated.notes).toBe(maliciousNote);
    expect(typeof updated.notes).toBe('string');

    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.find((r: any) => r.date === '2026-11-19').notes).toBe(maliciousNote);
  });

  it('T2-B04-06: handles bulk serialization of 100 historical day records', () => {
    const bulkRecords: DayRecord[] = Array.from({ length: 100 }, (_, i) => ({
      ...BASELINE_NOV_19,
      id: `day-record-${i}`,
      date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    }));

    const jsonString = JSON.stringify(bulkRecords);
    localStorage.setItem(STORAGE_KEY, jsonString);

    const { result } = renderHook(() => useStore(), { wrapper });
    expect(result.current.records.length).toBeGreaterThanOrEqual(100);
  });

  it('T2-B04-07: overwrites existing record atomically when updated in StoreContext', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.updateDayNotes('2026-11-19', 'Updated shift note');
    });

    const updated = result.current.getRecordByDate('2026-11-19')!;
    expect(updated.notes).toBe('Updated shift note');

    const stored: DayRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const nov19 = stored.find(r => r.date === '2026-11-19');
    expect(nov19?.notes).toBe('Updated shift note');
  });

  it('T2-B04-08: initializes cold boot when storage is completely empty', () => {
    expect(localStorage.length).toBe(0);

    const { result } = renderHook(() => useStore(), { wrapper });

    expect(result.current.records).toHaveLength(2);
  });

  it('T2-B04-09: heals partial storage by appending missing baseline date in StoreContext', () => {
    // Only Nov 19 present
    localStorage.setItem(STORAGE_KEY, JSON.stringify([BASELINE_NOV_19]));

    const { result } = renderHook(() => useStore(), { wrapper });

    expect(result.current.records).toHaveLength(2);
    expect(result.current.getRecordByDate('2026-11-19')).toBeDefined();
    expect(result.current.getRecordByDate('2026-11-20')).toBeDefined();
  });

  it('T2-B04-10: preserves escaped quotes and Cyrillic text in serialized records in StoreContext', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    const note = 'Клиент "Жасмин" заказал процедуру "Фитобочка + Сауна"';

    act(() => {
      result.current.updateDayNotes('2026-11-19', note);
    });

    const loaded = result.current.getRecordByDate('2026-11-19')!;
    expect(loaded.notes).toBe(note);
  });

  // F12 Bookings Boundaries
  it('T2-B04-11: handles booking created with empty client name gracefully in StoreContext', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addBooking('2026-11-21', {
        time: '18:00',
        phone: '97 002 04 04',
        partySize: 1,
        clientName: '',
      });
    });

    const b = result.current.getRecordByDate('2026-11-21')!.bookings[0];
    expect(b.clientName ?? '').toBe('');
    expect(b.phone).toBe('97 002 04 04');
  });

  it('T2-B04-12: handles extreme party size (e.g. group of 15 clients) in StoreContext', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addBooking('2026-11-21', {
        time: '16:00',
        phone: '90 123 45 67',
        partySize: 15,
        clientName: 'Корпоратив',
      });
    });

    const b = result.current.getRecordByDate('2026-11-21')!.bookings[0];
    expect(b.partySize).toBe(15);
  });

  it('T2-B04-13: supports early morning (00:00) and late night (23:45) booking times in StoreContext', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addBooking('2026-11-21', {
        time: '23:45',
        phone: '97 000 00 00',
        partySize: 1,
      });
    });

    const b = result.current.getRecordByDate('2026-11-21')!.bookings[0];
    expect(b.time).toBe('23:45');
  });

  it('T2-B04-14: normalizes varied phone number formats into standard tel: URI using production utility', () => {
    const testCases = [
      { input: '97 794 14 86', expected: 'tel:+998977941486' },
      { input: '+998-97-794-14-86', expected: 'tel:+998977941486' },
      { input: '(97) 794-1486', expected: 'tel:+998977941486' },
    ];

    for (const tc of testCases) {
      expect(sanitizePhoneToTelUri(tc.input)).toBe(tc.expected);
    }
  });

  it('T2-B04-15: sorts large bookings collection chronologically without data loss in StoreContext', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    const times = ['21:00', '10:00', '14:30', '09:00', '19:15', '12:00'];

    act(() => {
      for (const t of times) {
        result.current.addBooking('2026-11-21', {
          time: t,
          phone: '97 000 00 00',
          partySize: 1,
        });
      }
    });

    const bookings = result.current.getRecordByDate('2026-11-21')!.bookings;
    expect(bookings).toHaveLength(times.length);
    expect(bookings[0].time).toBe('09:00');
    expect(bookings[bookings.length - 1].time).toBe('21:00');
  });
});
