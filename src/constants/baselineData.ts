import { DayRecord, DaySummary } from '../types/accounting';

export const BASELINE_NOV_19: DayRecord = {
  id: 'journal-2026-11-19',
  date: '2026-11-19',
  dateFormatted: '19.11.2026',
  masters: [
    {
      id: 'm-iro-19',
      name: 'Иро',
      nameUz: 'Iro',
      clientCount: 2,
      revenue: 470000,
      payout: 200000,
      salonShare: 270000,
      clientSessions: [370000, 100000],
      orders: [
        {
          id: 'ord-iro-19-1',
          categoryId: 'cat-1',
          serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)',
          serviceNameUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)",
          durationMinutes: 60,
          price: 370000,
          timestamp: '15:30',
        },
        {
          id: 'ord-iro-19-2',
          categoryId: 'cat-custom',
          serviceName: 'Доплата / Дополнительный сеанс',
          serviceNameUz: "Qo'shimcha seans",
          durationMinutes: 40,
          price: 100000,
          timestamp: '17:00',
        },
      ],
    },
    {
      id: 'm-max-19',
      name: 'Мах',
      nameUz: 'Max',
      clientCount: 3,
      revenue: 1020000,
      payout: 300000,
      salonShare: 720000,
      clientSessions: [300000, 370000, 350000],
      orders: [
        {
          id: 'ord-max-19-1',
          categoryId: 'cat-1',
          serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)',
          serviceNameUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)",
          durationMinutes: 40,
          price: 300000,
          timestamp: '14:00',
        },
        {
          id: 'ord-max-19-2',
          categoryId: 'cat-1',
          serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)',
          serviceNameUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)",
          durationMinutes: 60,
          price: 370000,
          timestamp: '16:15',
        },
        {
          id: 'ord-max-19-3',
          categoryId: 'cat-2',
          serviceName: 'Фитобочка, Сауна, Массаж (медовый)',
          serviceNameUz: 'Fitobochka, Sauna, Massaj (asalli)',
          durationMinutes: 40,
          price: 350000,
          timestamp: '18:30',
        },
      ],
    },
    {
      id: 'm-komila-19',
      name: 'Комила',
      nameUz: 'Komila',
      clientCount: 1,
      revenue: 350000,
      payout: 100000,
      salonShare: 250000,
      clientSessions: [350000],
      orders: [
        {
          id: 'ord-kom-19-1',
          categoryId: 'cat-2',
          serviceName: 'Фитобочка, Сауна, Массаж (медовый)',
          serviceNameUz: 'Fitobochka, Sauna, Massaj (asalli)',
          durationMinutes: 40,
          price: 350000,
          timestamp: '19:00',
        },
      ],
    },
  ],
  expenses: {
    cleaning: 200000,
    other: 0,
    description: 'уборка 200',
  },
  bar: {
    revenue: 0,
    items: [],
  },
  bookings: [
    {
      id: 'b-nov19-1',
      date: '2026-11-19',
      phone: '97 794 14 86',
      time: '19:00',
      partySize: 2,
      notes: '2 к',
      completed: true,
    },
  ],
};

export const BASELINE_NOV_19_SUMMARY: DaySummary = {
  totalClients: 6,
  grossServiceRevenue: 1840000,
  barRevenue: 0,
  grossTotalRevenue: 1840000,
  totalMasterPayouts: 600000,
  cleaningExpenses: 200000,
  otherExpenses: 0,
  facilityExpenses: 200000,
  totalExpenses: 800000,
  netBalance: 1640000,
  netSalonProfit: 1040000,
};

export const BASELINE_NOV_19_LEDGER_VARIANT: DayRecord = {
  id: 'journal-2026-11-19-ledger',
  date: '2026-11-19',
  dateFormatted: '19.11.2026',
  masters: [
    { id: 'm-iro', name: 'Иро', nameUz: 'Iro', clientCount: 4, revenue: 1280000, payout: 400000, salonShare: 880000 },
    { id: 'm-max', name: 'Мах', nameUz: 'Max', clientCount: 2, revenue: 640000, payout: 200000, salonShare: 440000 },
    { id: 'm-komila', name: 'Комила', nameUz: 'Komila', clientCount: 2, revenue: 640000, payout: 200000, salonShare: 440000 },
  ],
  expenses: { cleaning: 200000, other: 0 },
  bar: { revenue: 440000, items: [{ name: 'Чай/Напитки', price: 440000 }] },
  bookings: [
    { id: 'b1', date: '2026-11-19', phone: '97 794 14 86', time: '19:00', partySize: 2, notes: 'Жасмин' },
  ],
};

export const BASELINE_NOV_19_LEDGER_SUMMARY: DaySummary = {
  totalClients: 8,
  grossServiceRevenue: 2560000,
  barRevenue: 440000,
  grossTotalRevenue: 3000000,
  totalMasterPayouts: 800000,
  cleaningExpenses: 200000,
  otherExpenses: 0,
  facilityExpenses: 200000,
  totalExpenses: 1000000,
  netBalance: 2800000,
  netSalonProfit: 2000000,
};

export const BASELINE_NOV_20: DayRecord = {
  id: 'journal-2026-11-20',
  date: '2026-11-20',
  dateFormatted: '20.11.2026',
  masters: [
    {
      id: 'm-max-shift1',
      name: 'Max (смена 1)',
      nameUz: 'Max (1-smena)',
      clientCount: 4,
      revenue: 950000,
      payout: 400000,
      salonShare: 550000,
      clientSessions: [350000, 250000, 250000, 100000],
      orders: [
        { id: 'ord-m1-1', categoryId: 'cat-2', serviceName: 'Фитобочка, Сауна, Массаж (медовый)', serviceNameUz: 'Fitobochka, Sauna, Massaj (asalli)', durationMinutes: 40, price: 350000 },
        { id: 'ord-m1-2', categoryId: 'cat-custom', serviceName: 'Массаж (экспресс)', serviceNameUz: 'Massaj (tezkor)', durationMinutes: 40, price: 250000 },
        { id: 'ord-m1-3', categoryId: 'cat-custom', serviceName: 'Массаж (экспресс)', serviceNameUz: 'Massaj (tezkor)', durationMinutes: 40, price: 250000 },
        { id: 'ord-m1-4', categoryId: 'cat-custom', serviceName: 'Доплата / Чайные', serviceNameUz: "Qo'shimcha to'lov", durationMinutes: 30, price: 100000 },
      ],
    },
    {
      id: 'm-iro-20',
      name: 'Иро',
      nameUz: 'Iro',
      clientCount: 5,
      revenue: 1400000,
      payout: 550000,
      salonShare: 850000,
      clientSessions: [300000, 250000, 250000, 250000, 350000],
      orders: [
        { id: 'ord-iro20-1', categoryId: 'cat-1', serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)', serviceNameUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)", durationMinutes: 40, price: 300000 },
        { id: 'ord-iro20-2', categoryId: 'cat-custom', serviceName: 'Массаж (экспресс)', serviceNameUz: 'Massaj (tezkor)', durationMinutes: 40, price: 250000 },
        { id: 'ord-iro20-3', categoryId: 'cat-custom', serviceName: 'Массаж (экспресс)', serviceNameUz: 'Massaj (tezkor)', durationMinutes: 40, price: 250000 },
        { id: 'ord-iro20-4', categoryId: 'cat-custom', serviceName: 'Массаж (экспресс)', serviceNameUz: 'Massaj (tezkor)', durationMinutes: 40, price: 250000 },
        { id: 'ord-iro20-5', categoryId: 'cat-4', serviceName: 'Арома массаж', serviceNameUz: 'Aroma massaj', durationMinutes: 40, price: 350000 },
      ],
    },
    {
      id: 'm-max-shift2',
      name: 'Max (смена 2)',
      nameUz: 'Max (2-smena)',
      clientCount: 4,
      revenue: 1000000,
      payout: 400000,
      salonShare: 600000,
      clientSessions: [300000, 200000, 250000, 250000],
      orders: [
        { id: 'ord-m2-1', categoryId: 'cat-1', serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)', serviceNameUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)", durationMinutes: 40, price: 300000 },
        { id: 'ord-m2-2', categoryId: 'cat-custom', serviceName: 'Массаж спины', serviceNameUz: 'Bel massaji', durationMinutes: 30, price: 200000 },
        { id: 'ord-m2-3', categoryId: 'cat-custom', serviceName: 'Массаж (экспресс)', serviceNameUz: 'Massaj (tezkor)', durationMinutes: 40, price: 250000 },
        { id: 'ord-m2-4', categoryId: 'cat-custom', serviceName: 'Массаж (экспресс)', serviceNameUz: 'Massaj (tezkor)', durationMinutes: 40, price: 250000 },
      ],
    },
    {
      id: 'm-komila-20',
      name: 'Комила',
      nameUz: 'Komila',
      clientCount: 2,
      revenue: 600000,
      payout: 200000,
      salonShare: 400000,
      clientSessions: [300000, 300000],
      orders: [
        { id: 'ord-kom20-1', categoryId: 'cat-1', serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)', serviceNameUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)", durationMinutes: 40, price: 300000 },
        { id: 'ord-kom20-2', categoryId: 'cat-1', serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)', serviceNameUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)", durationMinutes: 40, price: 300000 },
      ],
    },
  ],
  expenses: {
    cleaning: 200000,
    other: 0,
    description: 'уборка 200',
  },
  bar: {
    revenue: 440000,
    items: [
      { name: 'Бар 1', price: 50000 },
      { name: 'Бар 2', price: 10000 },
      { name: 'Бар 3', price: 80000 },
      { name: 'Бар 4', price: 300000 },
    ],
    notes: '50 10 80 300',
  },
  bookings: [
    {
      id: 'b-nov20-1',
      date: '2026-11-20',
      phone: '88 110 01 52',
      time: '20:00',
      partySize: 1,
      notes: 'Женщ. 20:00 (300 / [350])',
      completed: false,
    },
  ],
};

export const BASELINE_NOV_20_SUMMARY: DaySummary = {
  totalClients: 15,
  grossServiceRevenue: 3950000,
  barRevenue: 440000,
  grossTotalRevenue: 4390000,
  totalMasterPayouts: 1550000,
  cleaningExpenses: 200000,
  otherExpenses: 0,
  facilityExpenses: 200000,
  totalExpenses: 1750000,
  netBalance: 4190000,
  netSalonProfit: 2640000,
};

export const BASELINE_RECORDS: DayRecord[] = [
  BASELINE_NOV_19,
  BASELINE_NOV_20,
];

export const INITIAL_BASELINE_RECORDS: DayRecord[] = BASELINE_RECORDS;
