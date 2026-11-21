import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const DateNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate, currentRecord } = useStore();

  const handlePrevDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    d.setUTCDate(d.getUTCDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    d.setUTCDate(d.getUTCDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate('2026-11-20');
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">{t('journal.dateLabel')}</div>
          <div className="text-base font-bold text-white tracking-wide" data-testid="current-date-display">
            {currentRecord.dateFormatted || selectedDate}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevDay}
          data-testid="date-prev-btn"
          aria-label={t('journal.prevDay')}
          className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleToday}
          data-testid="date-today-btn"
          className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors"
        >
          {t('journal.today')}
        </button>

        <button
          type="button"
          onClick={handleNextDay}
          data-testid="date-next-btn"
          aria-label={t('journal.nextDay')}
          className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <input
          type="date"
          value={selectedDate}
          data-testid="date-picker-input"
          aria-label={t('journal.dateLabel')}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
        />
      </div>
    </div>
  );
};
