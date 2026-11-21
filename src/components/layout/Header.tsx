import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { usePwaInstall } from '../../utils/pwa';
import { getTashkentTimeString, formatTashkentDateDisplay } from '../../utils/date';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { language, setLanguage, t } = useTranslation();
  const { canInstall, triggerInstall } = usePwaInstall();

  const [tashkentTime, setTashkentTime] = useState(() => getTashkentTimeString());
  const [tashkentDate, setTashkentDate] = useState(() => formatTashkentDateDisplay(new Date(), language));

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTashkentTime(getTashkentTimeString(now, true));
      setTashkentDate(formatTashkentDateDisplay(now, language));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const clockLabel = language === 'ru' ? '🇺🇿 Время в Ташкенте' : '🇺🇿 Тошкент вақти';

  return (
    <header className="bg-slate-950/95 text-white shadow-2xl border-b border-emerald-900/40 sticky top-0 z-40 backdrop-blur-xl">
      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center p-0.5">
              <img 
                src="./icons/icon.svg" 
                alt="Бочка Здоровья" 
                width="40"
                height="40"
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white truncate leading-tight">
                  {t('app.title')}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm">
                  Admin POS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-400/80 truncate hidden xs:block leading-tight font-medium">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          {/* Center: Live Tashkent Digital Clock & Date Badge (prominent & glowing) */}
          <div
            data-testid="tashkent-live-clock"
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-lg shadow-emerald-950/40 backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs select-none">
              <span className="font-bold text-slate-300">
                {clockLabel}:
              </span>
              <span className="font-mono font-black text-emerald-300 tracking-wider text-sm drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                {tashkentTime}
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-slate-300 font-semibold">
                {tashkentDate}
              </span>
            </div>
          </div>

          {/* Right Actions & Language Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Install PWA button (if available) */}
            {canInstall && (
              <button
                type="button"
                onClick={triggerInstall}
                aria-label={t('app.installApp')}
                title={t('app.installApp')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('app.installApp')}</span>
              </button>
            )}

            {/* Bilingual Switcher: RU | UZ */}
            <div 
              className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 shadow-inner" 
              role="group" 
              aria-label="Language selection"
              data-testid="language-toggle"
            >
              <button
                type="button"
                onClick={() => setLanguage('ru')}
                data-testid="lang-btn-ru"
                aria-pressed={language === 'ru'}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  language === 'ru'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RU
              </button>
              <span className="text-slate-700 text-xs select-none">|</span>
              <button
                type="button"
                onClick={() => setLanguage('uz')}
                data-testid="lang-btn-uz"
                aria-pressed={language === 'uz'}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  language === 'uz'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                UZ
              </button>
            </div>
          </div>

        </div>

        {/* Mobile & Small Screen Live Tashkent Clock Bar */}
        <div
          data-testid="tashkent-live-clock-mobile"
          className="md:hidden flex items-center justify-between py-1.5 px-2.5 mb-1 bg-slate-900/80 border border-emerald-900/30 rounded-xl text-xs"
        >
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] text-slate-300">
              {clockLabel}:
            </span>
            <span className="font-mono font-black text-emerald-300 tracking-wider">
              {tashkentTime}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {tashkentDate}
          </div>
        </div>

        {/* Desktop Navigation Tabs (shown on md+ screens) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center space-x-1.5 py-2 border-t border-slate-800/80" aria-label="Desktop Navigation">
            <button
              type="button"
              onClick={() => onTabChange('journal')}
              aria-current={activeTab === 'journal' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'journal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t('nav.journal')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('pricelist')}
              aria-current={activeTab === 'pricelist' || activeTab === 'prices' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pricelist' || activeTab === 'prices'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t('nav.priceList')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('summary')}
              aria-current={activeTab === 'summary' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'summary'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t('journal.summarySection')}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
