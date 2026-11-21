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
    <header className="bg-black/75 backdrop-blur-2xl text-white shadow-xl border-b border-white/10 sticky top-0 z-40">
      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] overflow-hidden shadow-md flex-shrink-0 border border-white/10 bg-[#1c1c1e] flex items-center justify-center p-0.5">
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
                <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white truncate leading-tight">
                  {t('app.title')}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80 border border-white/10 shadow-sm">
                  Admin POS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-white/60 truncate hidden xs:block leading-tight font-medium">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          {/* Center: Live Tashkent Digital Clock & Date Badge (prominent & glowing) */}
          <div
            data-testid="tashkent-live-clock"
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-[16px] bg-[#1c1c1e] border border-white/10 shadow-lg backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30d158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#30d158]"></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs select-none">
              <span className="font-semibold text-white/70">
                {clockLabel}:
              </span>
              <span className="font-mono font-bold text-[#30d158] tracking-wider text-sm">
                {tashkentTime}
              </span>
              <span className="text-white/30 font-bold">•</span>
              <span className="text-white/80 font-medium">
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
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[14px] bg-[#30d158] hover:bg-[#28b84d] text-black transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('app.installApp')}</span>
              </button>
            )}

            {/* Bilingual Switcher: RU | UZ (iOS Segmented Control) */}
            <div 
              className="flex items-center bg-[#1c1c1e] rounded-[12px] p-0.5 border border-white/10 shadow-inner" 
              role="group" 
              aria-label="Language selection"
              data-testid="language-toggle"
            >
              <button
                type="button"
                onClick={() => setLanguage('ru')}
                data-testid="lang-btn-ru"
                aria-pressed={language === 'ru'}
                className={`px-3 py-1 rounded-[10px] text-xs font-bold transition-all ${
                  language === 'ru'
                    ? 'bg-[#2c2c2e] text-white shadow-sm ring-1 ring-white/10'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setLanguage('uz')}
                data-testid="lang-btn-uz"
                aria-pressed={language === 'uz'}
                className={`px-3 py-1 rounded-[10px] text-xs font-bold transition-all ${
                  language === 'uz'
                    ? 'bg-[#2c2c2e] text-white shadow-sm ring-1 ring-white/10'
                    : 'text-white/50 hover:text-white'
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
          className="md:hidden flex items-center justify-between py-1.5 px-3 mb-1 bg-[#1c1c1e] border border-white/10 rounded-[14px] text-xs"
        >
          <div className="flex items-center gap-1.5 text-white/80 font-semibold">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30d158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30d158]"></span>
            </span>
            <span className="text-[11px] text-white/70">
              {clockLabel}:
            </span>
            <span className="font-mono font-bold text-[#30d158] tracking-wider">
              {tashkentTime}
            </span>
          </div>
          <div className="text-[11px] text-white/50 font-medium">
            {tashkentDate}
          </div>
        </div>

        {/* Desktop Navigation Tabs (shown on md+ screens) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center space-x-1.5 py-2 border-t border-white/10" aria-label="Desktop Navigation">
            <button
              type="button"
              onClick={() => onTabChange('journal')}
              aria-current={activeTab === 'journal' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-[14px] text-xs font-bold transition-all ${
                activeTab === 'journal'
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('nav.journal')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('pricelist')}
              aria-current={activeTab === 'pricelist' || activeTab === 'prices' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-[14px] text-xs font-bold transition-all ${
                activeTab === 'pricelist' || activeTab === 'prices'
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('nav.priceList')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('summary')}
              aria-current={activeTab === 'summary' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-[14px] text-xs font-bold transition-all ${
                activeTab === 'summary'
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
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
