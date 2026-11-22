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
    <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 rounded-[22px] p-4 sm:p-5 shadow-sm dark:shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
      {/* Date Display with Calendar Badge */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-[16px] bg-emerald-50 text-emerald-600 dark:bg-[#30d158]/20 dark:text-[#30d158] flex items-center justify-center border border-emerald-200 dark:border-[#30d158]/30 shadow-inner flex-shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-600 dark:text-[#30d158] font-bold uppercase tracking-wider">
              {t('journal.dateLabel')}
            </span>
            {isToday && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-[#30d158]/20 dark:text-[#30d158] dark:border-[#30d158]/40">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{language === 'ru' ? 'Сегодня' : 'Bugun'}</span>
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <div
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-wide font-mono"
              data-testid="current-date-display"
            >
              {currentRecord.dateFormatted || selectedDate}
            </div>
            <span className="text-xs text-slate-500 dark:text-white/50 font-medium hidden xs:inline">
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
          className="p-2.5 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-white/80 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleToday}
          data-testid="date-today-btn"
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
            isToday
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md dark:bg-[#30d158] dark:text-black dark:hover:bg-[#28b84d]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-white/80 dark:border-white/10'
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
          className="p-2.5 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-white/80 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all shadow-sm cursor-pointer active:scale-95"
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
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:hover:border-white/20 text-xs font-mono font-bold dark:text-white rounded-[14px] px-3 py-2 focus:outline-none dark:focus:border-[#30d158] transition-all shadow-inner cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
