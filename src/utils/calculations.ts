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

  const barRevenue = Number(record.bar?.revenue) || 0;
  const grossTotalRevenue = grossServiceRevenue + barRevenue;

  const totalMasterPayouts = masters.reduce(
    (sum, m) => sum + (Number(m?.payout) || 0),
    0
  );

  const cleaningExpenses = Number(record.expenses?.cleaning) || 0;
  const otherExpenses = Number(record.expenses?.other) || 0;
  const totalFacilityExpenses = cleaningExpenses + otherExpenses;
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
export function calculateMasterPayout(clientCount: number, perClientRate = 100000, additional = 0): number {
  return ((Number(clientCount) || 0) * perClientRate) + additional;
}

/**
 * Calculates salon share: Revenue minus Master Payout.
 */
export function calculateSalonShare(revenue: number, payout: number): number {
  return (Number(revenue) || 0) - (Number(payout) || 0);
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
