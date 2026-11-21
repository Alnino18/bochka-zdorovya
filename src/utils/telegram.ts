import { DayRecord, DaySummary } from '../types/accounting';
import { formatCurrencyUZS, groupMasseurOrders } from './calculations';

export interface TelegramFormatResult {
  html: string;
  plainText: string;
}

/**
 * Generate luxury formatted Daily Report for Telegram and Clipboard export
 */
export function formatDailyTelegramReport(
  record: DayRecord,
  summary: DaySummary,
  language: 'ru' | 'uz' = 'ru'
): TelegramFormatResult {
  const isUz = language === 'uz';
  const masters = record.masters || [];

  // Plain Text Version
  const ptLines: string[] = [];
  ptLines.push(isUz ? '🌿 BOCHKA ZDOROVYA — KUNLIK KASSA HISOBOTI 🌿' : '🌿 БОЧКА ЗДОРОВЬЯ — ДНЕВНОЙ КАССОВЫЙ ОТЧЕТ 🌿');
  ptLines.push(`${isUz ? '📅 Sana' : '📅 Дата'}: ${record.dateFormatted || record.date}`);
  ptLines.push(`${isUz ? '👥 Jami mijozlar' : '👥 Всего клиентов'}: ${summary.totalClients}`);
  ptLines.push('');
  ptLines.push(
    isUz
      ? `💆‍♀️ Smenadagi massajistkalar (${masters.length}):`
      : `💆‍♀️ Массажистки на смене (${masters.length}):`
  );

  masters.forEach((m) => {
    const name = isUz && m.nameUz ? m.nameUz : m.name;
    const clientWord = isUz ? 'mijoz' : 'кл';
    ptLines.push(
      `  • ${name}: ${m.clientCount} ${clientWord} | ${formatCurrencyUZS(m.revenue, language)} (${isUz ? 'Ulushi' : 'Выплата'}: ${formatCurrencyUZS(m.payout, language)})`
    );

    const grouped = groupMasseurOrders(m, language);
    if (grouped.length > 0) {
      grouped.forEach((g) => {
        const durStr = g.durationMinutes > 0 ? ` (${g.durationMinutes} ${isUz ? 'daq' : 'мин'})` : '';
        ptLines.push(`     - ${g.count}x ${g.serviceName}${durStr} = ${formatCurrencyUZS(g.totalPrice, language)}`);
      });
    }
  });

  ptLines.push('');
  ptLines.push(isUz ? '💰 KUNLIK MOLIYAVIY YAKUN:' : '💰 ФИНАНСОВЫЙ ИТОГ ДНЯ:');
  ptLines.push(`• ${isUz ? 'Xizmatlar tushumi' : 'Выручка от услуг'}: ${formatCurrencyUZS(summary.grossServiceRevenue, language)}`);
  ptLines.push(`• ${isUz ? 'Bar va ichimliklar' : 'Бар и напитки'}: ${formatCurrencyUZS(summary.barRevenue, language)}`);
  ptLines.push(`• ${isUz ? 'Umumiy yalpi daromad' : 'Общий доход'}: ${formatCurrencyUZS(summary.grossTotalRevenue, language)}`);
  ptLines.push(`• ${isUz ? 'Massajistkalar ulushi' : 'Выплаты массажисткам'}: ${formatCurrencyUZS(summary.totalMasterPayouts, language)}`);
  ptLines.push(`• ${isUz ? 'Xarajatlar (tozalash)' : 'Расходы (уборка)'}: ${formatCurrencyUZS(summary.cleaningExpenses, language)}`);
  ptLines.push('───────────────────────────');
  ptLines.push(`💵 ${isUz ? 'KASSADAGI SOF QOLDIQ' : 'В КАССЕ (Наличные)'}: ${formatCurrencyUZS(summary.netBalance, language)}`);
  ptLines.push(`💎 ${isUz ? 'SALONNING SOF FOYDASI' : 'ЧИСТАЯ ПРИБЫЛЬ САЛОНА'}: ${formatCurrencyUZS(summary.netSalonProfit, language)}`);

  // HTML Version for Telegram API
  const htmlLines: string[] = [];
  htmlLines.push(isUz ? '🌿 <b>BOCHKA ZDOROVYA — KUNLIK KASSA HISOBOTI</b> 🌿' : '🌿 <b>БОЧКА ЗДОРОВЬЯ — ДНЕВНОЙ КАССОВЫЙ ОТЧЕТ</b> 🌿');
  htmlLines.push(`📅 <b>${isUz ? 'Sana' : 'Дата'}:</b> <code>${record.dateFormatted || record.date}</code>`);
  htmlLines.push(`👥 <b>${isUz ? 'Jami mijozlar' : 'Всего клиентов'}:</b> <b>${summary.totalClients}</b>`);
  htmlLines.push('');
  htmlLines.push(
    `💆‍♀️ <b>${isUz ? 'Smenadagi massajistkalar' : 'Массажистки на смене'} (${masters.length}):</b>`
  );

  masters.forEach((m) => {
    const name = isUz && m.nameUz ? m.nameUz : m.name;
    const clientWord = isUz ? 'mijoz' : 'кл';
    htmlLines.push(
      `• <b>${name}</b>: <code>${m.clientCount} ${clientWord}</code> | <b>${formatCurrencyUZS(m.revenue, language)}</b>\n  <i>(${isUz ? 'Ulushi' : 'Выплата'}: ${formatCurrencyUZS(m.payout, language)} | ${isUz ? 'Salon' : 'Салон'}: ${formatCurrencyUZS(m.salonShare, language)})</i>`
    );

    const grouped = groupMasseurOrders(m, language);
    if (grouped.length > 0) {
      grouped.forEach((g) => {
        const durStr = g.durationMinutes > 0 ? ` (${g.durationMinutes} ${isUz ? 'daq' : 'мин'})` : '';
        htmlLines.push(`   ▫️ <i>${g.count}x ${g.serviceName}${durStr} — ${formatCurrencyUZS(g.totalPrice, language)}</i>`);
      });
    }
  });

  htmlLines.push('');
  htmlLines.push(`💰 <b>${isUz ? 'KUNLIK MOLIYAVIY YAKUN' : 'ФИНАНСОВЫЙ ИТОГ ДНЯ'}:</b>`);
  htmlLines.push(`• <b>${isUz ? 'Xizmatlar tushumi' : 'Выручка от услуг'}:</b> <code>${formatCurrencyUZS(summary.grossServiceRevenue, language)}</code>`);
  htmlLines.push(`• <b>${isUz ? 'Bar va ichimliklar' : 'Бар и напитки'}:</b> <code>${formatCurrencyUZS(summary.barRevenue, language)}</code>`);
  htmlLines.push(`• <b>${isUz ? 'Umumiy yalpi daromad' : 'Общий валовый доход'}:</b> <code>${formatCurrencyUZS(summary.grossTotalRevenue, language)}</code>`);
  htmlLines.push(`• <b>${isUz ? 'Massajistkalar ulushi' : 'Выплаты массажисткам'}:</b> <code>${formatCurrencyUZS(summary.totalMasterPayouts, language)}</code>`);
  htmlLines.push(`• <b>${isUz ? 'Xarajatlar (tozalash)' : 'Расходы (уборка)'}:</b> <code>${formatCurrencyUZS(summary.cleaningExpenses, language)}</code>`);
  htmlLines.push('───────────────────────────');
  htmlLines.push(`💵 <b>${isUz ? 'KASSADAGI SOF QOLDIQ' : 'ОСТАТОК В КАССЕ'}:</b> <b>${formatCurrencyUZS(summary.netBalance, language)}</b>`);
  htmlLines.push(`💎 <b>${isUz ? 'SALONNING SOF FOYDASI' : 'ЧИСТАЯ ПРИБЫЛЬ САЛОНА'}:</b> <b>${formatCurrencyUZS(summary.netSalonProfit, language)}</b>`);

  return {
    plainText: ptLines.join('\n'),
    html: htmlLines.join('\n'),
  };
}

/**
 * Send report directly to Telegram Bot API
 */
export async function sendTelegramReport(
  botToken: string,
  chatId: string,
  htmlMessage: string
): Promise<{ success: boolean; error?: string }> {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return {
      success: false,
      error: 'Bot Token and Chat ID must be configured.',
    };
  }

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: htmlMessage,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true };
    } else {
      return {
        success: false,
        error: data.description || 'Failed to send message via Telegram Bot API.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error communicating with Telegram.',
    };
  }
}

/**
 * Copy plain text report to clipboard with fallback
 */
export async function copyReportToClipboard(text: string): Promise<boolean> {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
