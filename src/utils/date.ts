/**
 * Date & Time Utilities for Tashkent Timezone (Asia/Tashkent, UTC+5)
 */

export const TASHKENT_TIMEZONE = 'Asia/Tashkent';

/**
 * Returns today's date formatted as YYYY-MM-DD strictly in Asia/Tashkent timezone.
 * Uses 'sv-SE' locale with Intl.DateTimeFormat to ensure standard ISO YYYY-MM-DD format.
 */
export function getTashkentTodayDate(referenceDate: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TASHKENT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(referenceDate);
}

/**
 * Returns Tashkent time string formatted as HH:mm:ss (or HH:mm if includeSeconds is false).
 */
export function getTashkentTimeString(
  referenceDate: Date = new Date(),
  includeSeconds: boolean = true
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TASHKENT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  if (includeSeconds) {
    options.second = '2-digit';
  }
  return new Intl.DateTimeFormat('ru-RU', options).format(referenceDate);
}

/**
 * Formats a YYYY-MM-DD date or Date object into human-readable Tashkent date.
 * RU: 22 ноября 2026 г. / UZ: 22-ноябр
 */
const UZ_MONTHS_CYR = [
  'январ', 'феврал', 'март', 'апрел', 'май', 'июн',
  'июл', 'август', 'сентабр', 'октабр', 'ноябр', 'декабр'
];

export function formatTashkentDateDisplay(
  dateInput: string | Date = new Date(),
  language: 'ru' | 'uz' = 'ru'
): string {
  let date: Date;
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map(Number);
    if (parts.length === 3) {
      date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  const day = new Intl.DateTimeFormat('en-US', { timeZone: TASHKENT_TIMEZONE, day: 'numeric' }).format(date);
  const monthNum = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: TASHKENT_TIMEZONE, month: 'numeric' }).format(date),
    10
  );

  if (language === 'uz') {
    const monthName = UZ_MONTHS_CYR[monthNum - 1] || 'ноябр';
    return `${day}-${monthName}`;
  }

  const ruMonth = new Intl.DateTimeFormat('ru-RU', { timeZone: TASHKENT_TIMEZONE, month: 'long' }).format(date);
  return `${day} ${ruMonth}`;
}

/**
 * Formats full Tashkent live clock banner string.
 * Example: '🇺🇿 Тошкент вақти: 00:25:10 • 22-ноябр'
 */
export function getTashkentLiveHeaderString(
  date: Date = new Date(),
  language: 'ru' | 'uz' = 'ru'
): string {
  const time = getTashkentTimeString(date, true);
  const dateFormatted = formatTashkentDateDisplay(date, language);
  const label = language === 'ru' ? '🇺🇿 Время в Ташкенте' : '🇺🇿 Тошкент вақти';
  return `${label}: ${time} • ${dateFormatted}`;
}
