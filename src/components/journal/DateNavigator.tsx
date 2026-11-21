import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { getTashkentTodayDate, formatTashkentDateDisplay } from '../../utils/date';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';

export const DateNavigator: React.FC = () => {
  const { t, language } = useTranslation();
  const { selectedDate, setSelectedDate, currentRecord } = useStore();

  const tashkentToday = getTashkentTodayDate();
  const isToday = selectedDate === tashkentToday;

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
    setSelectedDate(tashkentToday);
  };

  const humanReadableDate = formatTashkentDateDisplay(selectedDate, language);

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-900/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Date Display with Calendar Badge */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-950/40 flex-shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-400/90 font-extrabold uppercase tracking-wider">
              {t('journal.dateLabel')}
            </span>
            {isToday && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{language === 'ru' ? 'Сегодня' : 'Bugun'}</span>
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <div
              className="text-lg sm:text-xl font-black text-white tracking-wide font-mono"
              data-testid="current-date-display"
            >
              {currentRecord.dateFormatted || selectedDate}
            </div>
            <span className="text-xs text-slate-400 font-medium hidden xs:inline">
              ({humanReadableDate})
            </span>
          </div>
        </div>
      </div>

      {/* Date Navigator Controls */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-center">
        <button
          type="button"
          onClick={handlePrevDay}
          data-testid="date-prev-btn"
          aria-label={t('journal.prevDay')}
          title={t('journal.prevDay')}
          className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleToday}
          data-testid="date-today-btn"
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 ${
            isToday
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-950/50 border border-emerald-400/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
          }`}
        >
          {t('journal.today')}
        </button>

        <button
          type="button"
          onClick={handleNextDay}
          data-testid="date-next-btn"
          aria-label={t('journal.nextDay')}
          title={t('journal.nextDay')}
          className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            data-testid="date-picker-input"
            aria-label={t('journal.dateLabel')}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 text-xs font-mono font-bold text-slate-200 rounded-2xl px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
