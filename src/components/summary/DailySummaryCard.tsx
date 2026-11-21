import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { formatCurrencyUZS } from '../../utils/calculations';
import { formatDailyTelegramReport, copyReportToClipboard } from '../../utils/telegram';
import { TelegramReportModal } from '../pos/TelegramReportModal';
import {
  Users,
  DollarSign,
  Coffee,
  TrendingUp,
  Scissors,
  Sparkles,
  Wallet,
  PiggyBank,
  Send,
  Copy,
  CheckCircle2,
} from 'lucide-react';

export const DailySummaryCard: React.FC = () => {
  const { t, language } = useTranslation();
  let summary = {
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
  let currentRecord: any = null;
  try {
    const store = useStore();
    summary = store.summary;
    currentRecord = store.currentRecord;
  } catch {}

  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = async () => {
    const report = formatDailyTelegramReport(currentRecord, summary, language);
    const ok = await copyReportToClipboard(report.plainText);
    if (ok) {
      setToastMessage(
        language === 'ru' ? 'Отчет скопирован в буфер обмена!' : 'Hisobot buferga nusxalandi!'
      );
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div
      className="bg-[#1c1c1e] border border-white/10 rounded-[24px] p-5 shadow-2xl space-y-4"
      data-testid="daily-summary-card"
    >
      {toastMessage && (
        <div className="bg-[#30d158]/15 border border-[#30d158]/40 text-[#30d158] text-xs px-3 py-2 rounded-[14px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[14px] bg-[#30d158]/20 text-[#30d158] flex items-center justify-center border border-[#30d158]/30">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              {t('journal.summarySection')}
            </h4>
            <span className="text-xs text-white/50">
              {summary.totalClients} {language === 'ru' ? 'клиентов' : 'mijoz'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white/80 hover:text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-white/70" />
            <span>{language === 'ru' ? 'Скопировать' : 'Nusxa olish'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsTelegramModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] bg-[#0a84ff] hover:bg-[#0071e3] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'В Telegram' : 'Telegramga'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Total Clients */}
        <div className="bg-[#2c2c2e] border border-white/5 rounded-[18px] p-3">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#30d158]" />
            <span>{t('journal.totalClients')}</span>
          </div>
          <div className="text-lg font-bold text-white mt-1" data-testid="metric-total-clients">
            {summary.totalClients}
          </div>
        </div>

        {/* Gross Service Revenue */}
        <div className="bg-[#2c2c2e] border border-white/5 rounded-[18px] p-3">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#30d158]" />
            <span>{t('journal.grossServiceRevenue')}</span>
          </div>
          <div
            className="text-sm font-bold text-[#30d158] mt-1 font-mono truncate"
            data-testid="metric-gross-service-revenue"
          >
            {formatCurrencyUZS(summary.grossServiceRevenue, language)}
          </div>
        </div>

        {/* Bar Sales */}
        <div className="bg-[#2c2c2e] border border-white/5 rounded-[18px] p-3">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-[#ffd60a]" />
            <span>{t('journal.barSales')}</span>
          </div>
          <div
            className="text-sm font-bold text-[#ffd60a] mt-1 font-mono truncate"
            data-testid="metric-bar-revenue"
          >
            {formatCurrencyUZS(summary.barRevenue, language)}
          </div>
        </div>

        {/* Gross Total Revenue */}
        <div className="bg-[#2c2c2e] border border-white/5 rounded-[18px] p-3">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('journal.totalGrossRevenue')}</span>
          </div>
          <div
            className="text-sm font-bold text-cyan-300 mt-1 font-mono truncate"
            data-testid="metric-gross-total-revenue"
          >
            {formatCurrencyUZS(summary.grossTotalRevenue, language)}
          </div>
        </div>

        {/* Master Payouts */}
        <div className="bg-[#2c2c2e] border border-white/5 rounded-[18px] p-3">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('journal.totalMasterPayouts')}</span>
          </div>
          <div
            className="text-sm font-bold text-indigo-300 mt-1 font-mono truncate"
            data-testid="metric-master-payouts"
          >
            {formatCurrencyUZS(summary.totalMasterPayouts, language)}
          </div>
        </div>

        {/* Cleaning Expenses */}
        <div className="bg-[#2c2c2e] border border-white/5 rounded-[18px] p-3">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('journal.cleaning')}</span>
          </div>
          <div
            className="text-sm font-bold text-rose-300 mt-1 font-mono truncate"
            data-testid="metric-cleaning-expenses"
          >
            {formatCurrencyUZS(summary.cleaningExpenses, language)}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#2c2c2e] border border-white/5 rounded-[18px] p-3">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('journal.facilityExpenses')}</span>
          </div>
          <div
            className="text-sm font-bold text-rose-300 mt-1 font-mono truncate"
            data-testid="metric-total-expenses"
          >
            {formatCurrencyUZS(summary.totalExpenses, language)}
          </div>
        </div>

        {/* Cash Desk Balance */}
        <div className="bg-[#1c1c1e] border border-[#30d158]/30 rounded-[18px] p-3 col-span-2 sm:col-span-1 shadow-sm">
          <div className="text-[11px] text-[#30d158] flex items-center gap-1.5 font-bold uppercase">
            <Wallet className="w-3.5 h-3.5 text-[#30d158]" />
            <span>{t('journal.cashDeskBalance')}</span>
          </div>
          <div
            className="text-sm font-bold text-[#30d158] mt-1 font-mono truncate"
            data-testid="metric-net-balance"
          >
            {formatCurrencyUZS(summary.netBalance, language)}
          </div>
        </div>

        {/* Net Salon Profit */}
        <div className="bg-[#1c1c1e] border border-[#30d158]/30 rounded-[18px] p-3 col-span-2 sm:col-span-1 shadow-sm">
          <div className="text-[11px] text-[#30d158] flex items-center gap-1.5 font-bold uppercase">
            <PiggyBank className="w-3.5 h-3.5 text-[#30d158]" />
            <span>{t('journal.netSalonProfit')}</span>
          </div>
          <div
            className="text-sm font-bold text-[#30d158] mt-1 font-mono truncate"
            data-testid="metric-net-profit"
          >
            {formatCurrencyUZS(summary.netSalonProfit, language)}
          </div>
        </div>
      </div>

      {isTelegramModalOpen && (
        <TelegramReportModal onClose={() => setIsTelegramModalOpen(false)} />
      )}
    </div>
  );
};

