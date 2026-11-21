import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StoreProvider, useStore } from '../../src/context/StoreContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(StoreProvider, null, children);

describe('Tier 1 - Feature F10: Master Operations & Payouts (R3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-F10-01: creates new master entry with 0 clients and 0 initial revenue in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addMaster('2026-11-20', { name: 'Наргиза', nameUz: 'Nargiza' });
    });

    const record = result.current.getRecordByDate('2026-11-20');
    const nargiza = record?.masters.find(m => m.name === 'Наргиза');

    expect(nargiza).toBeDefined();
    expect(nargiza?.clientCount).toBe(0);
    expect(nargiza?.revenue).toBe(0);
    expect(nargiza?.payout).toBe(0);
    expect(nargiza?.salonShare).toBe(0);
  });

  it('T1-F10-02: logs client session and increments client count, revenue, and payout in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addMaster('2026-11-21', { name: 'Иро', nameUz: 'Iro' });
    });

    const masterId = result.current.getRecordByDate('2026-11-21')!.masters[0].id;

    act(() => {
      result.current.addClientSession('2026-11-21', masterId, 320000);
      result.current.addClientSession('2026-11-21', masterId, 320000);
      result.current.addClientSession('2026-11-21', masterId, 320000);
    });

    const updated = result.current.getRecordByDate('2026-11-21')!.masters[0];
    expect(updated.clientCount).toBe(3);
    expect(updated.revenue).toBe(960000);
    expect(updated.payout).toBe(300000);
    expect(updated.salonShare).toBe(660000);
  });

  it('T1-F10-03: calculates standard master payout as 100,000 UZS flat per client session in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addMaster('2026-11-21', { name: 'Мах', nameUz: 'Max' });
    });

    const masterId = result.current.getRecordByDate('2026-11-21')!.masters[0].id;

    act(() => {
      result.current.addClientSession('2026-11-21', masterId, 300000);
      result.current.addClientSession('2026-11-21', masterId, 350000);
      result.current.addClientSession('2026-11-21', masterId, 400000);
      result.current.addClientSession('2026-11-21', masterId, 320000);
    });

    const master = result.current.getRecordByDate('2026-11-21')!.masters[0];
    expect(master.clientCount).toBe(4);
    expect(master.payout).toBe(400000);
  });

  it('T1-F10-04: calculates master salon share as revenue minus payout in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.addMaster('2026-11-21', { name: 'Комила', nameUz: 'Komila' });
    });

    const masterId = result.current.getRecordByDate('2026-11-21')!.masters[0].id;

    act(() => {
      result.current.addClientSession('2026-11-21', masterId, 320000);
      result.current.addClientSession('2026-11-21', masterId, 320000);
      result.current.addClientSession('2026-11-21', masterId, 320000);
      result.current.addClientSession('2026-11-21', masterId, 320000);
    });

    const master = result.current.getRecordByDate('2026-11-21')!.masters[0];
    expect(master.revenue).toBe(1280000);
    expect(master.payout).toBe(400000);
    expect(master.salonShare).toBe(master.revenue - master.payout);
    expect(master.salonShare).toBe(880000);
  });

  it('T1-F10-05: removes master from day roster and adjusts roster count in store', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    act(() => {
      result.current.setSelectedDate('2026-11-19');
    });

    const initialCount = result.current.currentRecord.masters.length;
    const masterToDelete = result.current.currentRecord.masters[0];

    act(() => {
      result.current.deleteMaster('2026-11-19', masterToDelete.id);
    });

    const updatedRecord = result.current.getRecordByDate('2026-11-19')!;
    expect(updatedRecord.masters).toHaveLength(initialCount - 1);
    expect(updatedRecord.masters.some(m => m.id === masterToDelete.id)).toBe(false);
  });
});
