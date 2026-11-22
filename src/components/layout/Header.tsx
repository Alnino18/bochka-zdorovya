import React, { useState, useEffect } from 'react';
import { Download, Sun, Moon } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { usePwaInstall } from '../../utils/pwa';
import { getTashkentTimeString, formatTashkentDateDisplay } from '../../utils/date';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { language, setLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
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
    <header className="bg-white/85 dark:bg-black/75 backdrop-blur-2xl text-slate-900 dark:text-white shadow-sm dark:shadow-xl border-b border-slate-200/80 dark:border-white/10 sticky top-0 z-40 transition-colors">
      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] overflow-hidden shadow-sm flex-shrink-0 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1c1c1e] flex items-center justify-center p-0.5">
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
                <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate leading-tight">
                  {t('app.title')}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/80 dark:border-white/10 shadow-sm">
                  Admin POS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-white/60 truncate hidden xs:block leading-tight font-medium">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          {/* Center: Live Tashkent Digital Clock & Date Badge (prominent & glowing) */}
          <div
            data-testid="tashkent-live-clock"
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-[16px] bg-slate-100/90 dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-[#30d158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 dark:bg-[#30d158]"></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs select-none">
              <span className="font-semibold text-slate-600 dark:text-white/70">
                {clockLabel}:
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-[#30d158] tracking-wider text-sm">
                {tashkentTime}
              </span>
              <span className="text-slate-300 dark:text-white/30 font-bold">•</span>
              <span className="text-slate-700 dark:text-white/80 font-medium">
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
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#30d158] dark:hover:bg-[#28b84d] dark:text-black transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('app.installApp')}</span>
              </button>
            )}

            {/* Day / Night (Light / Dark Mode) Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              data-testid="theme-toggle-btn"
              aria-label={theme === 'dark' ? (language === 'ru' ? 'Включить светлую тему' : 'Yorug‘ rejimga o‘tish') : (language === 'ru' ? 'Включить тёмную тему' : 'Qorong‘i rejimga o‘tish')}
              title={theme === 'dark' ? (language === 'ru' ? '☀️ Светлая тема (День)' : '☀️ Yorug‘ rejim (Kun)') : (language === 'ru' ? '🌙 Тёмная тема (Ночь)' : '🌙 Qorong‘i rejim (Tun)')}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 dark:bg-[#1c1c1e] dark:hover:bg-[#2c2c2e] text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-white/10 transition-all shadow-sm active:scale-95 cursor-pointer font-bold text-xs"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-amber-300 text-[11px]">{language === 'ru' ? 'День' : 'Kun'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline text-slate-700 text-[11px]">{language === 'ru' ? 'Ночь' : 'Tun'}</span>
                </>
              )}
            </button>

            {/* Bilingual Switcher: RU | UZ (iOS Segmented Control) */}
            <div 
              className="flex items-center bg-slate-100 dark:bg-[#1c1c1e] rounded-[12px] p-0.5 border border-slate-200 dark:border-white/10 shadow-inner" 
              role="group" 
              aria-label="Language selection"
              data-testid="language-toggle"
            >
              <button
                type="button"
                onClick={() => setLanguage('ru')}
                data-testid="lang-btn-ru"
                aria-pressed={language === 'ru'}
                className={`px-3 py-1 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                  language === 'ru'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-[#2c2c2e] dark:text-white dark:ring-white/10'
                    : 'text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white'
                }`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setLanguage('uz')}
                data-testid="lang-btn-uz"
                aria-pressed={language === 'uz'}
                className={`px-3 py-1 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                  language === 'uz'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-[#2c2c2e] dark:text-white dark:ring-white/10'
                    : 'text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white'
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
          className="md:hidden flex items-center justify-between py-1.5 px-3 mb-1 bg-slate-100 dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/10 rounded-[14px] text-xs"
        >
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-white/80 font-semibold">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-[#30d158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-[#30d158]"></span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-white/70">
              {clockLabel}:
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-[#30d158] tracking-wider">
              {tashkentTime}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-white/50 font-medium">
            {tashkentDate}
          </div>
        </div>

        {/* Desktop Navigation Tabs (shown on md+ screens) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center space-x-1.5 py-2 border-t border-slate-200/80 dark:border-white/10" aria-label="Desktop Navigation">
            <button
              type="button"
              onClick={() => onTabChange('journal')}
              aria-current={activeTab === 'journal' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-[14px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-emerald-600 text-white shadow-sm dark:bg-white/15 dark:text-white dark:border dark:border-white/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              {t('nav.journal')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('pricelist')}
              aria-current={activeTab === 'pricelist' || activeTab === 'prices' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-[14px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pricelist' || activeTab === 'prices'
                  ? 'bg-emerald-600 text-white shadow-sm dark:bg-white/15 dark:text-white dark:border dark:border-white/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              {t('nav.priceList')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('summary')}
              aria-current={activeTab === 'summary' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-[14px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-emerald-600 text-white shadow-sm dark:bg-white/15 dark:text-white dark:border dark:border-white/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
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
