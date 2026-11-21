import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StoreProvider, useStore } from '../../src/context/StoreContext';
import { formatPhoneTelUri } from '../../src/utils/calculations';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(StoreProvider, null, children);

describe('Tier 1 - Feature F12: Client Bookings Registry (R3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-F12-01: creates new client booking record with required appointment fields in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addBooking('2026-11-21', {
        time: '19:00',
        phone: '97 794 14 86',
        partySize: 2,
        clientName: 'Жасмин',
        notes: '2 к',
      });
    });

    const bookings = result.current.getRecordByDate('2026-11-21')!.bookings;
    expect(bookings).toHaveLength(1);
    const booking = bookings[0];
    expect(booking.id).toBeTruthy();
    expect(booking.time).toBe('19:00');
    expect(booking.phone).toBe('97 794 14 86');
    expect(booking.partySize).toBe(2);
    expect(booking.clientName).toBe('Жасмин');
    expect(booking.completed).toBe(false);
  });

  it('T1-F12-02: maintains array of bookings sorted chronologically by time in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addBooking('2026-11-21', { time: '20:00', phone: '88 110 01 52', partySize: 1 });
      result.current.addBooking('2026-11-21', { time: '14:30', phone: '97 794 14 86', partySize: 2 });
    });

    const bookings = result.current.getRecordByDate('2026-11-21')!.bookings;
    expect(bookings[0].time).toBe('14:30');
    expect(bookings[1].time).toBe('20:00');
  });

  it('T1-F12-03: normalizes phone number into clean dialer tel: URI using application calculation utility', () => {
    const rawPhone = '97 794 14 86';
    const telUri = formatPhoneTelUri(rawPhone);
    expect(telUri).toBe('tel:+998977941486');
  });

  it('T1-F12-04: toggles booking completion status between false and true in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addBooking('2026-11-21', { time: '19:00', phone: '97 794 14 86', partySize: 2 });
    });

    const bookingId = result.current.getRecordByDate('2026-11-21')!.bookings[0].id;

    act(() => {
      result.current.toggleBookingComplete('2026-11-21', bookingId);
    });
    expect(result.current.getRecordByDate('2026-11-21')!.bookings[0].completed).toBe(true);

    act(() => {
      result.current.toggleBookingComplete('2026-11-21', bookingId);
    });
    expect(result.current.getRecordByDate('2026-11-21')!.bookings[0].completed).toBe(false);
  });

  it('T1-F12-05: deletes booking from store bookings array', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addBooking('2026-11-21', { time: '19:00', phone: '97 794 14 86', partySize: 2 });
      result.current.addBooking('2026-11-21', { time: '20:00', phone: '88 110 01 52', partySize: 1 });
    });

    const b1Id = result.current.getRecordByDate('2026-11-21')!.bookings[0].id;

    act(() => {
      result.current.deleteBooking('2026-11-21', b1Id);
    });

    const remaining = result.current.getRecordByDate('2026-11-21')!.bookings;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).not.toBe(b1Id);
  });
});
