import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  DayRecord,
  DaySummary,
  MasterEntry,
  ClientBooking,
  DailyExpenses,
  BarSales,
  ServiceOrderItem,
  OrderUpdatePayload,
  TelegramConfig,
  StaffMember,
} from '../types/accounting';
import { ServiceCategory } from '../types/catalog';
import { SERVICE_CATEGORIES } from '../constants/catalogData';
import { BASELINE_RECORDS, BASELINE_NOV_19, BASELINE_NOV_20 } from '../constants/baselineData';
import { calculateDaySummary } from '../utils/calculations';
import { getTashkentTodayDate } from '../utils/date';

export const STORAGE_KEY = 'bochka_zdorovya_records_v1';
export const SERVICES_STORAGE_KEY = 'bochka_zdorovya_custom_services_v1';
export const TELEGRAM_STORAGE_KEY = 'bochka_telegram_config_v1';
export const STAFF_STORAGE_KEY = 'bochka_zdorovya_staff_roster_v1';

export const DEFAULT_STAFF: StaffMember[] = [
  { id: 'iro', name: 'Иро', nameUz: 'Iro', active: true },
  { id: 'max', name: 'Мах', nameUz: 'Max', active: true },
  { id: 'komila', name: 'Комила', nameUz: 'Komila', active: true },
];

export function loadInitialStaff(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [...DEFAULT_STAFF];
}

export function createEmptyDayRecord(date: string, staffList?: StaffMember[]): DayRecord {
  const parts = date.split('-');
  const dateFormatted = parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : date;
  const staff = staffList && staffList.length > 0 ? staffList : loadInitialStaff();
  
  const initialMasters: MasterEntry[] = staff.map((s) => ({
    id: `m-${s.id}-${date}`,
    name: s.name,
    nameUz: s.nameUz || s.name,
    clientCount: 0,
    revenue: 0,
    payout: 0,
    salonShare: 0,
    clientSessions: [],
    orders: [],
  }));

  return {
    id: `journal-${date}`,
    date,
    dateFormatted,
    masters: initialMasters,
    expenses: { cleaning: 0, other: 0 },
    bar: { revenue: 0 },
    bookings: [],
  };
}

export interface StoreContextType {
  // State
  records: DayRecord[];
  selectedDate: string;
  currentRecord: DayRecord;
  summary: DaySummary;
  storageError: string | null;

  // Staff Registry (Persistent Salon Massajistkas)
  staff: StaffMember[];
  addStaffMember: (member: { name: string; nameUz?: string }) => void;
  removeStaffMember: (staffId: string) => void;
  resetStaffToDefault: () => void;

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
  updateOrder: (date: string, currentMasterId: string, orderId: string, updates: OrderUpdatePayload) => void;
  removeOrder: (date: string, masterId: string, orderId: string) => void;

  // Dynamic Price List / Services Management
  services: ServiceCategory[];
  addServiceCategory: (category: Omit<ServiceCategory, 'id'>) => void;
  updateServiceCategory: (categoryId: string, updates: Partial<ServiceCategory>) => void;
  deleteServiceCategory: (categoryId: string) => void;
  addServiceOption: (categoryId: string, option: { durationMinutes: number; priceUZS: number }) => void;
  updateServiceOption: (categoryId: string, optionIndex: number, option: { durationMinutes: number; priceUZS: number }) => void;
  deleteServiceOption: (categoryId: string, optionIndex: number) => void;
  resetServicesToDefault: () => void;

  // Telegram Bot Reporting & Settings
  telegramConfig: TelegramConfig;
  updateTelegramConfig: (config: TelegramConfig) => void;

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

function loadInitialServices(): ServiceCategory[] {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [...SERVICE_CATEGORIES];
}

function loadInitialTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(TELEGRAM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          botToken: parsed.botToken || '',
          chatId: parsed.chatId || '',
        };
      }
    }
  } catch {}
  return { botToken: '', chatId: '' };
}

export const StoreProvider: React.FC<{ children: React.ReactNode; initialDate?: string }> = ({
  children,
  initialDate,
}) => {
  const [records, setRecords] = useState<DayRecord[]>(() => loadInitialRecords());
  const [services, setServices] = useState<ServiceCategory[]>(() => loadInitialServices());
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => loadInitialTelegramConfig());
  const [staff, setStaff] = useState<StaffMember[]>(() => loadInitialStaff());
  const [selectedDate, setSelectedDate] = useState<string>(() => initialDate || getTashkentTodayDate());
  const [storageError, setStorageError] = useState<string | null>(null);

  // Sync staff roster to localStorage
  const persistStaff = useCallback((updated: StaffMember[]) => {
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  const addStaffMember = useCallback(
    (member: { name: string; nameUz?: string }) => {
      const trimmedName = member.name.trim();
      const trimmedNameUz = member.nameUz?.trim() || trimmedName;
      const staffId = trimmedName.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '') || `staff-${Date.now()}`;
      setStaff((prev) => {
        if (prev.some((s) => s.name.toLowerCase() === trimmedName.toLowerCase())) return prev;
        const updated = [...prev, { id: staffId, name: trimmedName, nameUz: trimmedNameUz, active: true }];
        persistStaff(updated);
        return updated;
      });
    },
    [persistStaff]
  );

  const removeStaffMember = useCallback(
    (staffId: string) => {
      setStaff((prev) => {
        const updated = prev.filter((s) => s.id !== staffId && s.name.toLowerCase() !== staffId.toLowerCase());
        persistStaff(updated);
        return updated;
      });
    },
    [persistStaff]
  );

  const resetStaffToDefault = useCallback(() => {
    const defaults = [...DEFAULT_STAFF];
    setStaff(defaults);
    try {
      localStorage.removeItem(STAFF_STORAGE_KEY);
    } catch {}
  }, []);

  // Sync services to localStorage
  const persistServices = useCallback((updated: ServiceCategory[]) => {
    try {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  const addServiceCategory = useCallback(
    (category: Omit<ServiceCategory, 'id'>) => {
      setServices((prev) => {
        const newId = `cat-${Date.now()}`;
        const nextCategoryNumber =
          prev.length > 0 ? Math.max(...prev.map((c) => c.categoryNumber)) + 1 : 1;
        const newCat: ServiceCategory = {
          ...category,
          id: newId,
          categoryNumber: category.categoryNumber || nextCategoryNumber,
          options: category.options || [],
        };
        const updated = [...prev, newCat];
        persistServices(updated);
        return updated;
      });
    },
    [persistServices]
  );

  const updateServiceCategory = useCallback(
    (categoryId: string, updates: Partial<ServiceCategory>) => {
      setServices((prev) => {
        const updated = prev.map((cat) => (cat.id === categoryId ? { ...cat, ...updates } : cat));
        persistServices(updated);
        return updated;
      });
    },
    [persistServices]
  );

  const deleteServiceCategory = useCallback(
    (categoryId: string) => {
      setServices((prev) => {
        const updated = prev.filter((cat) => cat.id !== categoryId);
        persistServices(updated);
        return updated;
      });
    },
    [persistServices]
  );

  const addServiceOption = useCallback(
    (categoryId: string, option: { durationMinutes: number; priceUZS: number }) => {
      setServices((prev) => {
        const updated = prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          const options = [
            ...(cat.options || []),
            {
              posterItem: (cat.posterItems && cat.posterItems[0]) || 1,
              durationMinutes: option.durationMinutes,
              priceUZS: option.priceUZS,
              priceFormatted: `${option.priceUZS.toLocaleString()} UZS`,
            },
          ];
          return { ...cat, options };
        });
        persistServices(updated);
        return updated;
      });
    },
    [persistServices]
  );

  const updateServiceOption = useCallback(
    (
      categoryId: string,
      optionIndex: number,
      option: { durationMinutes: number; priceUZS: number }
    ) => {
      setServices((prev) => {
        const updated = prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          const options = [...(cat.options || [])];
          if (options[optionIndex]) {
            options[optionIndex] = {
              ...options[optionIndex],
              durationMinutes: option.durationMinutes,
              priceUZS: option.priceUZS,
              priceFormatted: `${option.priceUZS.toLocaleString()} UZS`,
            };
          }
          return { ...cat, options };
        });
        persistServices(updated);
        return updated;
      });
    },
    [persistServices]
  );

  const deleteServiceOption = useCallback(
    (categoryId: string, optionIndex: number) => {
      setServices((prev) => {
        const updated = prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          const options = [...(cat.options || [])];
          options.splice(optionIndex, 1);
          return { ...cat, options };
        });
        persistServices(updated);
        return updated;
      });
    },
    [persistServices]
  );

  const resetServicesToDefault = useCallback(() => {
    const defaults = [...SERVICE_CATEGORIES];
    setServices(defaults);
    try {
      localStorage.removeItem(SERVICES_STORAGE_KEY);
    } catch {}
  }, []);

  const updateTelegramConfig = useCallback((config: TelegramConfig) => {
    setTelegramConfig(config);
    try {
      localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }, []);

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
    return found || createEmptyDayRecord(selectedDate, staff);
  }, [records, selectedDate, staff]);

  const summary = useMemo(() => {
    return calculateDaySummary(currentRecord);
  }, [currentRecord]);

  const ensureRecordExists = useCallback(
    (list: DayRecord[], date: string): { list: DayRecord[]; index: number } => {
      const idx = list.findIndex((r) => r.date === date);
      if (idx >= 0) {
        return { list: [...list], index: idx };
      }
      const newRecord = createEmptyDayRecord(date, staff);
      const updated = [...list, newRecord];
      return { list: updated, index: updated.length - 1 };
    },
    [staff]
  );

  // Master Operations
  const addMaster = useCallback(
    (date: string, master: { name: string; nameUz?: string; initialSession?: number }) => {
      const trimmedName = master.name.trim();
      const trimmedNameUz = master.nameUz?.trim() || trimmedName;
      const staffId = trimmedName.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '') || `staff-${Date.now()}`;

      // 1. Add to permanent salon staff registry and save in localStorage
      setStaff((prevStaff) => {
        const exists = prevStaff.some(
          (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (!exists) {
          const updatedStaff = [...prevStaff, { id: staffId, name: trimmedName, nameUz: trimmedNameUz, active: true }];
          persistStaff(updatedStaff);
          return updatedStaff;
        }
        return prevStaff;
      });

      // 2. Add or update in records for this date
      updateRecords((prev) => {
        const { list, index } = ensureRecordExists(prev, date);
        const target = { ...list[index] };
        const initialSession = Number(master.initialSession) || 0;
        const clientCount = initialSession > 0 ? 1 : 0;
        const revenue = initialSession;
        const payout = clientCount * 100000;
        const salonShare = revenue - payout;

        const existingIdx = target.masters.findIndex(
          (m) => m.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (existingIdx >= 0) {
          const m = target.masters[existingIdx];
          const updatedMaster: MasterEntry = {
            ...m,
            name: trimmedName,
            nameUz: trimmedNameUz,
            clientCount: m.clientCount + clientCount,
            revenue: m.revenue + revenue,
            payout: m.payout + payout,
            salonShare: (m.revenue + revenue) - (m.payout + payout),
            clientSessions: initialSession > 0 ? [...(m.clientSessions || []), initialSession] : (m.clientSessions || []),
            orders: initialSession > 0 ? [
              ...(m.orders || []),
              {
                id: `ord-${Date.now()}`,
                serviceName: `Сеанс (${initialSession.toLocaleString()} UZS)`,
                serviceNameUz: `Seans (${initialSession.toLocaleString()} so'm)`,
                durationMinutes: initialSession >= 400000 ? 60 : 40,
                price: initialSession,
              }
            ] : (m.orders || []),
          };
          const updatedMasters = [...target.masters];
          updatedMasters[existingIdx] = updatedMaster;
          target.masters = updatedMasters;
        } else {
          const id = `m-${staffId}-${date}-${Math.random().toString(36).substr(2, 4)}`;
          const newEntry: MasterEntry = {
            id,
            name: trimmedName,
            nameUz: trimmedNameUz,
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
        }

        list[index] = target;
        return list;
      });
    },
    [ensureRecordExists, persistStaff, updateRecords]
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

  const updateOrder = useCallback(
    (date: string, currentMasterId: string, orderId: string, updates: OrderUpdatePayload) => {
      updateRecords((prev) => {
        const idx = prev.findIndex((r) => r.date === date);
        if (idx < 0) return prev;
        const list = [...prev];
        const target = { ...list[idx] };

        const currentMaster = target.masters.find((m) => m.id === currentMasterId);
        if (!currentMaster) return prev;
        const currentOrder = (currentMaster.orders || []).find((o) => o.id === orderId);
        if (!currentOrder) return prev;

        const isChangingMaster = !!(updates.newMasterId && updates.newMasterId !== currentMasterId);
        const targetMasterId = isChangingMaster ? updates.newMasterId! : currentMasterId;
        const targetMaster = target.masters.find((m) => m.id === targetMasterId);
        if (!targetMaster) return prev;

        // Calculate bar items difference if any bar items were modified
        const oldBarSum = (currentOrder.barItems || []).reduce((acc, it) => acc + (it.price || 0), 0);
        const newBarSum =
          updates.barItems !== undefined
            ? updates.barItems.reduce((acc, it) => acc + (it.price || 0), 0)
            : oldBarSum;
        const barDiff = newBarSum - oldBarSum;
        if (barDiff !== 0) {
          const currentBarRev = target.bar?.revenue || 0;
          target.bar = {
            ...target.bar,
            revenue: Math.max(0, currentBarRev + barDiff),
          };
        }

        const newPrice = updates.price !== undefined ? updates.price : currentOrder.price;
        const updatedOrder: ServiceOrderItem = {
          ...currentOrder,
          serviceName: updates.serviceName !== undefined ? updates.serviceName : currentOrder.serviceName,
          serviceNameUz:
            updates.serviceNameUz !== undefined ? updates.serviceNameUz : currentOrder.serviceNameUz,
          durationMinutes:
            updates.durationMinutes !== undefined
              ? updates.durationMinutes
              : currentOrder.durationMinutes,
          price: newPrice,
          barItems: updates.barItems !== undefined ? updates.barItems : currentOrder.barItems,
          notes: updates.notes !== undefined ? updates.notes : currentOrder.notes,
        };

        if (isChangingMaster) {
          // Remove from currentMaster and add to targetMaster
          target.masters = target.masters.map((m) => {
            if (m.id === currentMasterId) {
              const orders = (m.orders || []).filter((o) => o.id !== orderId);
              const clientSessions = [...(m.clientSessions || [])];
              const fIdx = clientSessions.indexOf(currentOrder.price);
              if (fIdx >= 0) clientSessions.splice(fIdx, 1);
              const clientCount = Math.max(0, (m.clientCount || 0) - 1);
              const revenue = Math.max(0, (m.revenue || 0) - currentOrder.price);
              const payout = Math.max(0, (m.payout || 0) - 100000);
              const salonShare = revenue - payout;
              return { ...m, orders, clientSessions, clientCount, revenue, payout, salonShare };
            }
            if (m.id === targetMasterId) {
              const orders = [...(m.orders || []), updatedOrder];
              const clientSessions = [...(m.clientSessions || []), newPrice];
              const clientCount = (m.clientCount || 0) + 1;
              const revenue = (m.revenue || 0) + newPrice;
              const payout = (m.payout || 0) + 100000;
              const salonShare = revenue - payout;
              return { ...m, orders, clientSessions, clientCount, revenue, payout, salonShare };
            }
            return m;
          });
        } else {
          // Update in same master
          target.masters = target.masters.map((m) => {
            if (m.id !== currentMasterId) return m;
            const orders = (m.orders || []).map((o) => (o.id === orderId ? updatedOrder : o));
            const priceDiff = newPrice - currentOrder.price;
            const clientSessions = [...(m.clientSessions || [])];
            const fIdx = clientSessions.indexOf(currentOrder.price);
            if (fIdx >= 0) {
              clientSessions[fIdx] = newPrice;
            } else {
              clientSessions.push(newPrice);
            }
            const revenue = Math.max(0, (m.revenue || 0) + priceDiff);
            const payout = m.payout || 0; // client count unchanged
            const salonShare = revenue - payout;
            return { ...m, orders, clientSessions, revenue, salonShare };
          });
        }

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
    setStaff([...DEFAULT_STAFF]);
    try {
      localStorage.removeItem(STAFF_STORAGE_KEY);
    } catch {}
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
      staff,
      addStaffMember,
      removeStaffMember,
      resetStaffToDefault,
      addMaster,
      updateMaster,
      deleteMaster,
      addClientSession,
      addOrder,
      updateOrder,
      removeOrder,
      services,
      addServiceCategory,
      updateServiceCategory,
      deleteServiceCategory,
      addServiceOption,
      updateServiceOption,
      deleteServiceOption,
      resetServicesToDefault,
      telegramConfig,
      updateTelegramConfig,
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
      staff,
      addStaffMember,
      removeStaffMember,
      resetStaffToDefault,
      addMaster,
      updateMaster,
      deleteMaster,
      addClientSession,
      addOrder,
      updateOrder,
      removeOrder,
      services,
      addServiceCategory,
      updateServiceCategory,
      deleteServiceCategory,
      addServiceOption,
      updateServiceOption,
      deleteServiceOption,
      resetServicesToDefault,
      telegramConfig,
      updateTelegramConfig,
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
