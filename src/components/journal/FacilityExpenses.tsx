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
    <div className="bg-[#1c1c1e] border border-white/10 rounded-[22px] p-5 shadow-lg space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Sparkles className="w-4 h-4 text-[#ffd60a]" />
        <h4 className="text-sm font-bold text-white">{t('journal.expensesSection')} & {t('journal.barSection')}</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Cleaning Expense */}
        <div>
          <label htmlFor="input-cleaning" className="block text-xs font-medium text-white/70 mb-1">
            {t('journal.cleaning')} (UZS)
          </label>
          <input
            id="input-cleaning"
            type="number"
            min="0"
            value={cleaning}
            data-testid="input-cleaning-expense"
            onChange={handleCleaningChange}
            className="w-full bg-[#2c2c2e] border border-white/10 text-sm text-white rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-[#ffd60a]"
          />
        </div>

        {/* Other Expense */}
        <div>
          <label htmlFor="input-other" className="block text-xs font-medium text-white/70 mb-1">
            {t('journal.otherExpenses')} (UZS)
          </label>
          <input
            id="input-other"
            type="number"
            min="0"
            value={other}
            data-testid="input-other-expense"
            onChange={handleOtherChange}
            className="w-full bg-[#2c2c2e] border border-white/10 text-sm text-white rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-[#ffd60a]"
          />
        </div>

        {/* Bar Sales */}
        <div>
          <label htmlFor="input-bar" className="block text-xs font-medium text-white/70 mb-1 flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-[#ffd60a]" />
            <span>{t('journal.barRevenue')} (UZS)</span>
          </label>
          <input
            id="input-bar"
            type="number"
            min="0"
            value={barRevenue}
            data-testid="input-bar-revenue"
            onChange={handleBarRevenueChange}
            className="w-full bg-[#2c2c2e] border border-white/10 text-sm text-white rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-[#ffd60a]"
          />
        </div>
      </div>
    </div>
  );
};
