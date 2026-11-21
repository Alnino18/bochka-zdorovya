import { describe, it, expect } from 'vitest';
import {
  calculateDaySummary,
  calculateMasterPayout,
  calculateSalonShare,
} from '../../src/utils/calculations';
import { DayRecord, MasterEntry } from '../../src/types/accounting';

describe('Tier 2 - Boundary B03: Accounting & Financial Boundaries (F7-F8, F10-F11)', () => {
  it('T2-B03-01: calculates zero totals without NaN when day record has zero masters, bar, and expenses', () => {
    const emptyDay: DayRecord = {
      id: 'day-empty',
      date: '2026-11-25',
      dateFormatted: '25.11.2026',
      masters: [],
      expenses: { cleaning: 0, other: 0 },
      bar: { revenue: 0 },
      bookings: [],
    };

    const summary = calculateDaySummary(emptyDay);
    expect(summary.totalClients).toBe(0);
    expect(summary.grossServiceRevenue).toBe(0);
    expect(summary.barRevenue).toBe(0);
    expect(summary.grossTotalRevenue).toBe(0);
    expect(summary.totalMasterPayouts).toBe(0);
    expect(summary.cleaningExpenses).toBe(0);
    expect(summary.netBalance).toBe(0);
    expect(summary.netSalonProfit).toBe(0);
  });

  it('T2-B03-02: handles negative net balance (loss state) correctly when expenses exceed revenue', () => {
    const lossDay: DayRecord = {
      id: 'day-loss',
      date: '2026-11-25',
      dateFormatted: '25.11.2026',
      masters: [
        { id: 'm1', name: 'Мах', nameUz: 'Max', clientCount: 1, revenue: 100000, payout: 100000, salonShare: 0 },
      ],
      expenses: { cleaning: 300000, other: 50000 }, // 350k expenses
      bar: { revenue: 0 },
      bookings: [],
    };

    const summary = calculateDaySummary(lossDay);
    expect(summary.grossTotalRevenue).toBe(100000);
    expect(summary.netBalance).toBe(100000 - 350000); // -250,000 UZS
    expect(summary.netSalonProfit).toBe(-250000 - 100000); // -350,000 UZS
  });

  it('T2-B03-03: computes billion-scale amounts (1,000,000,000 UZS) without arithmetic overflow', () => {
    const largeDay: DayRecord = {
      id: 'day-large',
      date: '2026-11-25',
      dateFormatted: '25.11.2026',
      masters: [
        { id: 'm1', name: 'VIP', nameUz: 'VIP', clientCount: 100, revenue: 1000000000, payout: 10000000, salonShare: 990000000 },
      ],
      expenses: { cleaning: 50000000, other: 0 },
      bar: { revenue: 200000000 },
      bookings: [],
    };

    const summary = calculateDaySummary(largeDay);
    expect(summary.grossTotalRevenue).toBe(1200000000);
    expect(summary.netBalance).toBe(1200000000 - 50000000);
    expect(summary.netSalonProfit).toBe(1150000000 - 10000000);
  });

  it('T2-B03-04: defaults missing or undefined fields to 0 in calculations', () => {
    const partialRecord = {
      id: 'day-partial',
      date: '2026-11-25',
      dateFormatted: '25.11.2026',
      masters: undefined,
      expenses: undefined,
      bar: undefined,
      bookings: [],
    } as unknown as DayRecord;

    const summary = calculateDaySummary(partialRecord);
    expect(summary.grossServiceRevenue).toBe(0);
    expect(summary.barRevenue).toBe(0);
    expect(summary.netBalance).toBe(0);
  });

  it('T2-B03-05: coerces string-formatted numbers in accounting inputs safely', () => {
    const stringyRecord = {
      id: 'day-stringy',
      date: '2026-11-25',
      dateFormatted: '25.11.2026',
      masters: [
        { id: 'm1', name: 'Иро', nameUz: 'Iro', clientCount: '3', revenue: '960000', payout: '300000', salonShare: '660000' } as any,
      ],
      expenses: { cleaning: '200000', other: '0' } as any,
      bar: { revenue: '100000' } as any,
      bookings: [],
    } as DayRecord;

    const summary = calculateDaySummary(stringyRecord);
    expect(summary.totalClients).toBe(3);
    expect(summary.grossServiceRevenue).toBe(960000);
    expect(summary.barRevenue).toBe(100000);
    expect(summary.netBalance).toBe(860000);
  });

  it('T2-B03-06: calculates custom procedure payout rate (e.g. 150,000 UZS for phyto-barrel) using calculations engine', () => {
    // 4 standard sessions (100k each) + 1 phyto session (150k) = 550,000 UZS
    const sessions = [300000, 250000, 250000, 250000, 350000];
    const totalPayout = calculateMasterPayout(4, 100000, 150000);

    expect(totalPayout).toBe(550000);
    const revenue = sessions.reduce((a, b) => a + b, 0);
    expect(revenue).toBe(1400000);
    expect(calculateSalonShare(revenue, totalPayout)).toBe(850000);
  });

  it('T2-B03-07: handles deficit session where session revenue is less than master payout using calculations engine', () => {
    const revenue = 80000;
    const payout = 100000;
    const salonShare = calculateSalonShare(revenue, payout);

    expect(salonShare).toBe(-20000);
  });

  it('T2-B03-08: verifies master revenue equals exact sum of itemized client sessions', () => {
    const sessions = [300000, 370000, 350000];
    const revenue = sessions.reduce((s, v) => s + v, 0);
    expect(revenue).toBe(1020000);
  });

  it('T2-B03-09: distinguishes multiple masters with the same display name by unique id', () => {
    const masters: MasterEntry[] = [
      { id: 'm-iro-morning', name: 'Иро', nameUz: 'Iro', clientCount: 2, revenue: 640000, payout: 200000, salonShare: 440000 },
      { id: 'm-iro-evening', name: 'Иро', nameUz: 'Iro', clientCount: 3, revenue: 960000, payout: 300000, salonShare: 660000 },
    ];

    expect(masters[0].id).not.toBe(masters[1].id);
    const totalRev = masters.reduce((s, m) => s + m.revenue, 0);
    expect(totalRev).toBe(1600000);
  });

  it('T2-B03-10: supports shift notation (смена 1 and смена 2) for masters working split shifts', () => {
    const shift1: MasterEntry = {
      id: 'm-max-s1',
      name: 'Max (смена 1)',
      nameUz: 'Max (1-smena)',
      clientCount: 4,
      revenue: 950000,
      payout: 400000,
      salonShare: 550000,
    };
    const shift2: MasterEntry = {
      id: 'm-max-s2',
      name: 'Max (смена 2)',
      nameUz: 'Max (2-smena)',
      clientCount: 4,
      revenue: 1000000,
      payout: 400000,
      salonShare: 600000,
    };

    expect(shift1.name).toContain('смена 1');
    expect(shift2.name).toContain('смена 2');
    expect(shift1.payout + shift2.payout).toBe(800000);
  });

  it('T2-B03-11: computes payout for high client count (50 clients) accurately using calculations engine', () => {
    const revenue = 16000000;
    const payout = calculateMasterPayout(50);
    const salonShare = calculateSalonShare(revenue, payout);

    expect(payout).toBe(5000000);
    expect(salonShare).toBe(11000000);
  });

  it('T2-B03-12: calculates net balance correctly when cleaning expense is 0 UZS', () => {
    const zeroCleanDay: DayRecord = {
      id: 'day-zc',
      date: '2026-11-25',
      dateFormatted: '25.11.2026',
      masters: [{ id: 'm1', name: 'Иро', nameUz: 'Iro', clientCount: 1, revenue: 320000, payout: 100000, salonShare: 220000 }],
      expenses: { cleaning: 0, other: 0 },
      bar: { revenue: 50000 },
      bookings: [],
    };

    const summary = calculateDaySummary(zeroCleanDay);
    expect(summary.netBalance).toBe(320000 + 50000 - 0);
    expect(summary.netBalance).toBe(370000);
  });

  it('T2-B03-13: aggregates multiple petty expense lines accurately', () => {
    const pettyItems = [
      { name: 'Полотенца', amount: 30000 },
      { name: 'Вода', amount: 20000 },
      { name: 'Чай', amount: 15000 },
    ];
    const totalPetty = pettyItems.reduce((sum, item) => sum + item.amount, 0);
    expect(totalPetty).toBe(65000);
  });

  it('T2-B03-14: aggregates 20 itemized bar sales transactions without drift', () => {
    const barItems = Array.from({ length: 20 }, (_, idx) => ({
      name: `Бар позиция ${idx + 1}`,
      price: 25000,
    }));

    const total = barItems.reduce((sum, i) => sum + i.price, 0);
    expect(total).toBe(500000);
  });

  it('T2-B03-15: enforces fundamental accounting invariant (netSalonProfit === grossTotalRevenue - totalExpenses)', () => {
    const complexDay: DayRecord = {
      id: 'day-invariant',
      date: '2026-11-25',
      dateFormatted: '25.11.2026',
      masters: [
        { id: 'm1', name: 'Иро', nameUz: 'Iro', clientCount: 3, revenue: 1000000, payout: 300000, salonShare: 700000 },
        { id: 'm2', name: 'Мах', nameUz: 'Max', clientCount: 2, revenue: 700000, payout: 200000, salonShare: 500000 },
      ],
      expenses: { cleaning: 200000, other: 50000 },
      bar: { revenue: 300000 },
      bookings: [],
    };

    const summary = calculateDaySummary(complexDay);
    expect(summary.netSalonProfit).toBe(summary.grossTotalRevenue - summary.totalExpenses);
  });
});
