import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  DayRecord,
  DaySummary,
  MasterEntry,
  ClientBooking,
  DailyExpenses,
  BarSales,
  ServiceOrderItem,
} from '../types/accounting';
import { BASELINE_RECORDS, BASELINE_NOV_19, BASELINE_NOV_20 } from '../constants/baselineData';
import { calculateDaySummary } from '../utils/calculations';

export const STORAGE_KEY = 'bochka_zdorovya_records_v1';

export interface StoreContextType {
  // State
  records: DayRecord[];
  selectedDate: string;
  currentRecord: DayRecord;
  summary: DaySummary;
  storageError: string | null;

  // Date Navigation
  setSelectedDate: (date: string) => void;
  getRecordByDate: (date: string) => DayRecord | undefined;

  // Master Operations (F10)
  addMaster: (date: string, master: { name: string; nameUz?: string; initialSession?: number }) => void;
  updateMaster: (date: string, masterId: string, updates: Partial<MasterEntry>) => void;
  deleteMaster: (date: string, masterId: string) => void;
  addClientSession: (date: string, masterId: string, sessionFee: number, isSpecial?: boolean) => void;

  // POS Order Terminal Operations
  addOrder: (
    date: string,
    masterId: string,
    order: {
      categoryId?: string;
      serviceName: string;
      serviceNameUz?: string;
      durationMinutes: number;
      price: number;
    }
  ) => void;
  removeOrder: (date: string, masterId: string, orderId: string) => void;

  // Bookings Registry (F12)
  addBooking: (date: string, booking: Omit<ClientBooking, 'id' | 'date'>) => void;
  updateBooking: (date: string, bookingId: string, updates: Partial<ClientBooking>) => void;
  toggleBookingComplete: (date: string, bookingId: string) => void;
  deleteBooking: (date: string, bookingId: string) => void;

  // Facility Expenses & Bar Sales (F11)
  updateExpenses: (date: string, expenses: Partial<DailyExpenses>) => void;
  updateBar: (date: string, bar: Partial<BarSales>) => void;
  addBarSale: (date: string, amount: number, name?: string) => void;

  // Day Notes
  updateDayNotes: (date: string, notes: string) => void;

  // Backup, Restore & Reset (F09, B04)
  resetToBaseline: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function createEmptyDayRecord(date: string): DayRecord {
  const parts = date.split('-');
  const dateFormatted = parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : date;
  return {
    id: `journal-${date}`,
    date,
    dateFormatted,
    masters: [],
    expenses: { cleaning: 0, other: 0 },
    bar: { revenue: 0 },
    bookings: [],
  };
}

function loadInitialRecords(): DayRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [...BASELINE_RECORDS];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      } catch {}
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [...BASELINE_RECORDS];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      } catch {}
      return initial;
    }

    // Self-healing: ensure baseline dates are present if partially missing
    const hasNov19 = parsed.some((r: any) => r && r.date === '2026-11-19');
    const hasNov20 = parsed.some((r: any) => r && r.date === '2026-11-20');

    const healed = [...parsed];
    if (!hasNov19) healed.unshift(BASELINE_NOV_19);
    if (!hasNov20) healed.push(BASELINE_NOV_20);

    return healed;
  } catch {
    return [...BASELINE_RECORDS];
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<DayRecord[]>(() => loadInitialRecords());
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-19');
  const [storageError, setStorageError] = useState<string | null>(null);

  // Sync to localStorage
  const persistRecords = useCallback((updated: DayRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setStorageError(null);
    } catch (err: any) {
      if (err?.name === 'QuotaExceededError' || err?.message?.toLowerCase().includes('quota')) {
        setStorageError('QuotaExceededError');
      } else {
        setStorageError(err?.message || 'StorageError');
      }
    }
  }, []);

  const updateRecords = useCallback(
    (updater: (prev: DayRecord[]) => DayRecord[]) => {
      setRecords((prev) => {
        const next = updater(prev);
        persistRecords(next);
        return next;
      });
    },
    [persistRecords]
  );

  const getRecordByDate = useCallback(
    (date: string): DayRecord | undefined => {
      return records.find((r) => r.date === date);
    },
    [records]
  );

  const currentRecord = useMemo((): DayRecord => {
    const found = records.find((r) => r.date === selectedDate);
    return found || createEmptyDayRecord(selectedDate);
  }, [records, selectedDate]);

  const summary = useMemo(() => {
    return calculateDaySummary(currentRecord);
  }, [currentRecord]);

  const ensureRecordExists = (list: DayRecord[], date: string): { list: DayRecord[]; index: number } => {
    const idx = list.findIndex((r) => r.date === date);
    if (idx >= 0) {
      return { list: [...list], index: idx };
    }
    const newRecord = createEmptyDayRecord(date);
    const updated = [...list, newRecord];
    return { list: updated, index: updated.length - 1 };
  };

  // Master Operations
  const addMaster = useCallback(
    (date: string, master: { name: string; nameUz?: string; initialSession?: number }) => {
      updateRecords((prev) => {
        const { list, index } = ensureRecordExists(prev, date);
        const target = { ...list[index] };
        const id = `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const initialSession = Number(master.initialSession) || 0;
        const clientCount = initialSession > 0 ? 1 : 0;
        const revenue = initialSession;
        const payout = clientCount * 100000;
        const salonShare = revenue - payout;

        const newEntry: MasterEntry = {
          id,
          name: master.name,
          nameUz: master.nameUz || master.name,
          clientCount,
          revenue,
          payout,
          salonShare,
          clientSessions: initialSession > 0 ? [initialSession] : [],
          orders: initialSession > 0 ? [{
            id: `ord-${Date.now()}`,
            serviceName: `Сеанс (${initialSession.toLocaleString()} UZS)`,
            serviceNameUz: `Seans (${initialSession.toLocaleString()} so'm)`,
            durationMinutes: initialSession >= 400000 ? 60 : 40,
            price: initialSession,
          }] : [],
        };

        target.masters = [...target.masters, newEntry];
        list[index] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const updateMaster = useCallback(
    (date: string, masterId: string, updates: Partial<MasterEntry>) => {
      updateRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === date);
        if (idx < 0) return prev;
        const list = [...prev];
        const target = { ...list[idx] };
        target.masters = target.masters.map((m) => {
          if (m.id !== masterId) return m;
          const merged = { ...m, ...updates };
          merged.salonShare = (merged.revenue || 0) - (merged.payout || 0);
          return merged;
        });
        list[idx] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const deleteMaster = useCallback(
    (date: string, masterId: string) => {
      updateRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === date);
        if (idx < 0) return prev;
        const list = [...prev];
        const target = { ...list[idx] };
        target.masters = target.masters.filter((m) => m.id !== masterId);
        list[idx] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const addClientSession = useCallback(
    (date: string, masterId: string, sessionFee: number, isSpecial?: boolean) => {
      updateRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === date);
        if (idx < 0) return prev;
        const list = [...prev];
        const target = { ...list[idx] };
        target.masters = target.masters.map((m) => {
          if (m.id !== masterId) return m;
          const newSessions = [...(m.clientSessions || []), sessionFee];
          const clientCount = (m.clientCount || 0) + 1;
          const revenue = (m.revenue || 0) + sessionFee;
          const payoutAddition = isSpecial ? 150000 : 100000;
          const payout = (m.payout || 0) + payoutAddition;
          const salonShare = revenue - payout;
          const synthOrder: ServiceOrderItem = {
            id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            serviceName: `Сеанс (${sessionFee.toLocaleString()} UZS)`,
            serviceNameUz: `Seans (${sessionFee.toLocaleString()} so'm)`,
            durationMinutes: sessionFee >= 400000 ? 60 : 40,
            price: sessionFee,
          };
          const newOrders = [...(m.orders || []), synthOrder];
          return {
            ...m,
            clientCount,
            revenue,
            payout,
            salonShare,
            clientSessions: newSessions,
            orders: newOrders,
          };
        });
        list[idx] = target;
        return list;
      });
    },
    [updateRecords]
  );

  // POS Order Terminal Operations
  const addOrder = useCallback(
    (
      date: string,
      masterId: string,
      order: {
        categoryId?: string;
        serviceName: string;
        serviceNameUz?: string;
        durationMinutes: number;
        price: number;
      }
    ) => {
      updateRecords((prev) => {
        const { list, index } = ensureRecordExists(prev, date);
        const target = { ...list[index] };
        target.masters = target.masters.map((m) => {
          if (m.id !== masterId) return m;
          const orderId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const newOrder: ServiceOrderItem = {
            id: orderId,
            categoryId: order.categoryId,
            serviceName: order.serviceName,
            serviceNameUz: order.serviceNameUz || order.serviceName,
            durationMinutes: order.durationMinutes,
            price: order.price,
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          };
          const orders = [...(m.orders || []), newOrder];
          const clientSessions = [...(m.clientSessions || []), order.price];
          const clientCount = (m.clientCount || 0) + 1;
          const revenue = (m.revenue || 0) + order.price;
          const payout = (m.payout || 0) + 100000;
          const salonShare = revenue - payout;
          return {
            ...m,
            clientCount,
            revenue,
            payout,
            salonShare,
            clientSessions,
            orders,
          };
        });
        list[index] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const removeOrder = useCallback(
    (date: string, masterId: string, orderId: string) => {
      updateRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === date);
        if (idx < 0) return prev;
        const list = [...prev];
        const target = { ...list[idx] };
        target.masters = target.masters.map((m) => {
          if (m.id !== masterId) return m;
          const orderToRemove = (m.orders || []).find((o) => o.id === orderId);
          if (!orderToRemove) return m;
          const orders = (m.orders || []).filter((o) => o.id !== orderId);
          const clientSessions = [...(m.clientSessions || [])];
          const feeIdx = clientSessions.indexOf(orderToRemove.price);
          if (feeIdx >= 0) {
            clientSessions.splice(feeIdx, 1);
          }
          const clientCount = Math.max(0, (m.clientCount || 0) - 1);
          const revenue = Math.max(0, (m.revenue || 0) - orderToRemove.price);
          const payout = Math.max(0, (m.payout || 0) - 100000);
          const salonShare = revenue - payout;
          return {
            ...m,
            clientCount,
            revenue,
            payout,
            salonShare,
            clientSessions,
            orders,
          };
        });
        list[idx] = target;
        return list;
      });
    },
    [updateRecords]
  );

  // Bookings Registry
  const addBooking = useCallback(
    (date: string, booking: Omit<ClientBooking, 'id' | 'date'>) => {
      updateRecords((prev) => {
        const { list, index } = ensureRecordExists(prev, date);
        const target = { ...list[index] };
        const id = `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newBooking: ClientBooking = {
          ...booking,
          id,
          date,
          clientName: booking.clientName !== undefined ? booking.clientName : '',
          completed: booking.completed ?? false,
        };
        const allBookings = [...target.bookings, newBooking];
        allBookings.sort((a, b) => a.time.localeCompare(b.time));
        target.bookings = allBookings;
        list[index] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const updateBooking = useCallback(
    (date: string, bookingId: string, updates: Partial<ClientBooking>) => {
      updateRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === date);
        if (idx < 0) return prev;
        const list = [...prev];
        const target = { ...list[idx] };
        target.bookings = target.bookings.map((b) => (b.id === bookingId ? { ...b, ...updates } : b));
        list[idx] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const toggleBookingComplete = useCallback(
    (date: string, bookingId: string) => {
      updateRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === date);
        if (idx < 0) return prev;
        const list = [...prev];
        const target = { ...list[idx] };
        target.bookings = target.bookings.map((b) =>
          b.id === bookingId ? { ...b, completed: !b.completed } : b
        );
        list[idx] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const deleteBooking = useCallback(
    (date: string, bookingId: string) => {
      updateRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === date);
        if (idx < 0) return prev;
        const list = [...prev];
        const target = { ...list[idx] };
        target.bookings = target.bookings.filter((b) => b.id !== bookingId);
        list[idx] = target;
        return list;
      });
    },
    [updateRecords]
  );

  // Expenses & Bar
  const updateExpenses = useCallback(
    (date: string, expenses: Partial<DailyExpenses>) => {
      updateRecords((prev) => {
        const { list, index } = ensureRecordExists(prev, date);
        const target = { ...list[index] };
        target.expenses = {
          ...target.expenses,
          ...expenses,
        };
        list[index] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const updateBar = useCallback(
    (date: string, bar: Partial<BarSales>) => {
      updateRecords((prev) => {
        const { list, index } = ensureRecordExists(prev, date);
        const target = { ...list[index] };
        target.bar = {
          ...target.bar,
          ...bar,
        };
        list[index] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const addBarSale = useCallback(
    (date: string, amount: number, name?: string) => {
      updateRecords((prev) => {
        const { list, index } = ensureRecordExists(prev, date);
        const target = { ...list[index] };
        const currentBar = target.bar || { revenue: 0, items: [] };
        const currentItems = currentBar.items || [];
        const newItem = { name: name || `Бар ${currentItems.length + 1}`, price: amount };
        const newRevenue = (currentBar.revenue || 0) + amount;
        target.bar = {
          ...currentBar,
          revenue: newRevenue,
          items: [...currentItems, newItem],
        };
        list[index] = target;
        return list;
      });
    },
    [updateRecords]
  );

  const updateDayNotes = useCallback(
    (date: string, notes: string) => {
      updateRecords((prev) => {
        const { list, index } = ensureRecordExists(prev, date);
        const target = { ...list[index], notes };
        list[index] = target;
        return list;
      });
    },
    [updateRecords]
  );

  // Backup & Reset
  const resetToBaseline = useCallback(() => {
    const baselineCopy = JSON.parse(JSON.stringify(BASELINE_RECORDS));
    setRecords(baselineCopy);
    persistRecords(baselineCopy);
    setSelectedDate('2026-11-19');
  }, [persistRecords]);

  const exportData = useCallback((): string => {
    const payload = {
      app: 'Бочка Здоровья',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      records,
    };
    return JSON.stringify(payload, null, 2);
  }, [records]);

  const importData = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        let importedRecords: DayRecord[];
        if (Array.isArray(parsed)) {
          importedRecords = parsed;
        } else if (parsed && Array.isArray(parsed.records)) {
          importedRecords = parsed.records;
        } else {
          return false;
        }

        if (importedRecords.length === 0) return false;

        setRecords(importedRecords);
        persistRecords(importedRecords);
        if (importedRecords[0]?.date) {
          setSelectedDate(importedRecords[0].date);
        }
        return true;
      } catch {
        return false;
      }
    },
    [persistRecords]
  );

  const value = useMemo(
    () => ({
      records,
      selectedDate,
      currentRecord,
      summary,
      storageError,
      setSelectedDate,
      getRecordByDate,
      addMaster,
      updateMaster,
      deleteMaster,
      addClientSession,
      addOrder,
      removeOrder,
      addBooking,
      updateBooking,
      toggleBookingComplete,
      deleteBooking,
      updateExpenses,
      updateBar,
      addBarSale,
      updateDayNotes,
      resetToBaseline,
      exportData,
      importData,
    }),
    [
      records,
      selectedDate,
      currentRecord,
      summary,
      storageError,
      setSelectedDate,
      getRecordByDate,
      addMaster,
      updateMaster,
      deleteMaster,
      addClientSession,
      addOrder,
      removeOrder,
      addBooking,
      updateBooking,
      toggleBookingComplete,
      deleteBooking,
      updateExpenses,
      updateBar,
      addBarSale,
      updateDayNotes,
      resetToBaseline,
      exportData,
      importData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
