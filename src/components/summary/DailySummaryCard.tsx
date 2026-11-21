import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { formatCurrencyUZS } from '../../utils/calculations';
import { Users, DollarSign, Coffee, TrendingUp, Scissors, Sparkles, Wallet, PiggyBank } from 'lucide-react';

export const DailySummaryCard: React.FC = () => {
  const { t, language } = useTranslation();
  const { summary } = useStore();

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4" data-testid="daily-summary-card">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Wallet className="w-4 h-4 text-teal-400" />
          <span>{t('journal.summarySection')}</span>
        </h4>
        <span className="text-xs text-slate-400">
          {summary.totalClients} {language === 'ru' ? 'клиентов' : 'mijoz'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Total Clients */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('journal.totalClients')}</span>
          </div>
          <div className="text-lg font-bold text-white mt-1" data-testid="metric-total-clients">
            {summary.totalClients}
          </div>
        </div>

        {/* Gross Service Revenue */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('journal.grossServiceRevenue')}</span>
          </div>
          <div className="text-sm font-bold text-teal-300 mt-1" data-testid="metric-gross-service-revenue">
            {formatCurrencyUZS(summary.grossServiceRevenue, language)}
          </div>
        </div>

        {/* Bar Sales */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('journal.barSales')}</span>
          </div>
          <div className="text-sm font-bold text-amber-300 mt-1" data-testid="metric-bar-revenue">
            {formatCurrencyUZS(summary.barRevenue, language)}
          </div>
        </div>

        {/* Gross Total Revenue */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('journal.totalGrossRevenue')}</span>
          </div>
          <div className="text-sm font-bold text-cyan-300 mt-1" data-testid="metric-gross-total-revenue">
            {formatCurrencyUZS(summary.grossTotalRevenue, language)}
          </div>
        </div>

        {/* Master Payouts */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('journal.totalMasterPayouts')}</span>
          </div>
          <div className="text-sm font-bold text-indigo-300 mt-1" data-testid="metric-master-payouts">
            {formatCurrencyUZS(summary.totalMasterPayouts, language)}
          </div>
        </div>

        {/* Cleaning Expenses */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('journal.cleaning')}</span>
          </div>
          <div className="text-sm font-bold text-rose-300 mt-1" data-testid="metric-cleaning-expenses">
            {formatCurrencyUZS(summary.cleaningExpenses, language)}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('journal.facilityExpenses')}</span>
          </div>
          <div className="text-sm font-bold text-rose-300 mt-1" data-testid="metric-total-expenses">
            {formatCurrencyUZS(summary.totalExpenses, language)}
          </div>
        </div>

        {/* Cash Desk Balance */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('journal.cashDeskBalance')}</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-1" data-testid="metric-net-balance">
            {formatCurrencyUZS(summary.netBalance, language)}
          </div>
        </div>

        {/* Net Salon Profit */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('journal.netSalonProfit')}</span>
          </div>
          <div className="text-sm font-bold text-emerald-300 mt-1" data-testid="metric-net-profit">
            {formatCurrencyUZS(summary.netSalonProfit, language)}
          </div>
        </div>
      </div>
    </div>
  );
};
