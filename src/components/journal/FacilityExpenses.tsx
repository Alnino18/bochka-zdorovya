import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Coffee } from 'lucide-react';

export const FacilityExpenses: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate, currentRecord, updateExpenses, updateBar } = useStore();

  const cleaning = currentRecord?.expenses?.cleaning ?? 0;
  const other = currentRecord?.expenses?.other ?? 0;
  const barRevenue = currentRecord?.bar?.revenue ?? 0;

  const handleCleaningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    updateExpenses(selectedDate, { cleaning: val });
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    updateExpenses(selectedDate, { other: val });
  };

  const handleBarRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    updateBar(selectedDate, { revenue: val });
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h4 className="text-sm font-bold text-white">{t('journal.expensesSection')} & {t('journal.barSection')}</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Cleaning Expense */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {t('journal.cleaning')} (UZS)
          </label>
          <input
            type="number"
            value={cleaning}
            data-testid="input-cleaning-expense"
            onChange={handleCleaningChange}
            className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Other Expense */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {t('journal.otherExpenses')} (UZS)
          </label>
          <input
            type="number"
            value={other}
            data-testid="input-other-expense"
            onChange={handleOtherChange}
            className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Bar Sales */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('journal.barRevenue')} (UZS)</span>
          </label>
          <input
            type="number"
            value={barRevenue}
            data-testid="input-bar-revenue"
            onChange={handleBarRevenueChange}
            className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
