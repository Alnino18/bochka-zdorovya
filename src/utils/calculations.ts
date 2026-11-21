import { DayRecord, DaySummary } from '../types/accounting';

/**
 * Authoritative financial calculation engine matching PROJECT.md equations:
 * 1. Gross Service Revenue = Σ(Master Revenues)
 * 2. Gross Total Revenue = Gross Service Revenue + Bar Sales
 * 3. Total Expenses = Facility Cleaning + Other Expenses + Total Master Payouts
 * 4. Cash Desk Net Balance = Gross Total Revenue - (Facility Cleaning + Other Expenses)
 * 5. Net Salon Profit = Cash Desk Net Balance - Total Master Payouts
 */
export function calculateDaySummary(record: DayRecord | null | undefined): DaySummary {
  if (!record) {
    return {
      totalClients: 0,
      grossServiceRevenue: 0,
      barRevenue: 0,
      grossTotalRevenue: 0,
      totalMasterPayouts: 0,
      cleaningExpenses: 0,
      otherExpenses: 0,
      facilityExpenses: 0,
      totalExpenses: 0,
      netBalance: 0,
      netSalonProfit: 0,
    };
  }

  const masters = Array.isArray(record.masters) ? record.masters : [];

  const totalClients = masters.reduce(
    (sum, m) => sum + (Number(m?.clientCount) || 0),
    0
  );

  const grossServiceRevenue = masters.reduce(
    (sum, m) => sum + (Number(m?.revenue) || 0),
    0
  );

  let barRevenue = Number(record.bar?.revenue);
  if (isNaN(barRevenue)) {
    barRevenue = Array.isArray(record.bar?.items)
      ? record.bar.items.reduce((sum, item) => sum + (Number(item?.price) || 0), 0)
      : 0;
  }
  const grossTotalRevenue = grossServiceRevenue + barRevenue;

  const totalMasterPayouts = masters.reduce(
    (sum, m) => sum + (Number(m?.payout) || 0),
    0
  );

  const cleaningExpenses = Number(record.expenses?.cleaning) || 0;
  const otherExpenses = Number(record.expenses?.other) || 0;
  const facilityExpenses = cleaningExpenses + otherExpenses;
  const totalFacilityExpenses = facilityExpenses;
  const totalExpenses = totalFacilityExpenses + totalMasterPayouts;

  const netBalance = grossTotalRevenue - totalFacilityExpenses;
  const netSalonProfit = netBalance - totalMasterPayouts;

  return {
    totalClients,
    grossServiceRevenue,
    barRevenue,
    grossTotalRevenue,
    totalMasterPayouts,
    cleaningExpenses,
    otherExpenses,
    facilityExpenses,
    totalExpenses,
    netBalance,
    netSalonProfit,
  };
}

/**
 * Formats numbers into spaced UZS currency format:
 * - Russian: "300 000 UZS"
 * - Uzbek: "300 000 so'm"
 */
export function formatCurrencyUZS(amount: number, language: 'ru' | 'uz' = 'ru'): string {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return language === 'ru' ? `${formatted} UZS` : `${formatted} so'm`;
}

/**
 * Calculates master payout based on standard rate (100,000 UZS/client) plus custom adjustment.
 */
export function calculateMasterPayout(clientCount: number, perClientRate: number = 100000, additional: number = 0): number {
  const count = Number(clientCount) || 0;
  const rate = typeof perClientRate === 'number' && !isNaN(perClientRate)
    ? perClientRate
    : (Number(perClientRate) || 100000);
  const extra = Number(additional) || 0;
  return (count * rate) + extra;
}

/**
 * Calculates salon share: Revenue minus Master Payout.
 */
export function calculateSalonShare(revenue: number, payout: number): number {
  return (Number(revenue) || 0) - (Number(payout) || 0);
}

/**
 * Calculates complete master metrics from an array of session fees.
 */
export function calculateMasterStats(
  sessions: number[] = [],
  perClientRate = 100000,
  customPayout?: number
): { clientCount: number; revenue: number; payout: number; salonShare: number } {
  const clientCount = Array.isArray(sessions) ? sessions.length : 0;
  const revenue = Array.isArray(sessions)
    ? sessions.reduce((sum, s) => sum + (Number(s) || 0), 0)
    : 0;
  const payout = customPayout !== undefined && !isNaN(Number(customPayout))
    ? Number(customPayout)
    : clientCount * perClientRate;
  const salonShare = revenue - payout;
  return { clientCount, revenue, payout, salonShare };
}

/**
 * Parses user input strings like "300 250 250 100" or "300, 250" into individual session amounts.
 * Shorthand numbers under 1000 (e.g. 300) are treated as thousands (300,000 UZS).
 */
export function parseSessionFees(input: string | null | undefined): number[] {
  if (!input || typeof input !== 'string') return [];
  return input
    .split(/[\s,;/]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const num = Number(s);
      if (isNaN(num)) return 0;
      return num < 1000 && num > 0 ? num * 1000 : num;
    })
    .filter((num) => num > 0);
}

/**
 * Aggregates itemized bar sales transactions into a total revenue sum.
 */
export function aggregateBarItems(items: Array<{ price: number }> | null | undefined): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (Number(item?.price) || 0), 0);
}

/**
 * Parses shorthand bar items string (e.g. "50 10 80 300") into itemized records.
 */
export function parseBarItemsInput(input: string | null | undefined): Array<{ name: string; price: number }> {
  if (!input || typeof input !== 'string') return [];
  const tokens = input.split(/[\s,;/]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  return tokens.map((token, index) => {
    const rawNum = Number(token);
    const price = !isNaN(rawNum) && rawNum > 0 ? (rawNum < 1000 ? rawNum * 1000 : rawNum) : 0;
    return {
      name: `Бар ${index + 1}`,
      price,
    };
  }).filter((item) => item.price > 0);
}

/**
 * Formats currency amount with space separators and currency unit ("сум" / "so'm").
 */
export function formatPriceUZS(amount: number, language: 'ru' | 'uz' = 'ru'): string {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return language === 'ru' ? `${formatted} сум` : `${formatted} so'm`;
}

/**
 * Formats duration in minutes with localized suffix ("мин" / "daq").
 */
export function formatDuration(minutes: number, language: 'ru' | 'uz' = 'ru'): string {
  const mins = Math.round(Number(minutes) || 0);
  return language === 'ru' ? `${mins} мин` : `${mins} daq`;
}

/**
 * Sanitizes phone numbers into clean numeric tel: URI format.
 * Example: "+998 (97) 002-04-04" -> "tel:+998970020404"
 */
export function sanitizePhoneToTelUri(phone: string | null | undefined): string | null {
  if (!phone || !phone.trim()) return null;
  const digitsOnly = phone.replace(/\D/g, '');
  if (!digitsOnly) return null;
  return digitsOnly.startsWith('998') ? `tel:+${digitsOnly}` : `tel:+998${digitsOnly}`;
}

/**
 * Format phone string to standard international tel URI.
 */
export function formatPhoneTelUri(phone: string | null | undefined): string {
  const sanitized = sanitizePhoneToTelUri(phone);
  return sanitized || 'tel:+998970020404';
}

/**
 * Normalizes Instagram handle into standard https:// profile URL.
 * Example: "@Bochka_zdorovya" -> "https://instagram.com/Bochka_zdorovya"
 */
export function normalizeInstagramUrl(handleOrUrl: string | null | undefined): string {
  if (!handleOrUrl || !handleOrUrl.trim()) return '';
  const trimmed = handleOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanHandle = trimmed.replace(/^@/, '');
  return `https://instagram.com/${cleanHandle}`;
}
