import React from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { usePwaInstall } from '../../utils/pwa';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { language, setLanguage, t } = useTranslation();
  const { canInstall, triggerInstall } = usePwaInstall();

  return (
    <header className="bg-slate-950/95 text-white shadow-xl border-b border-emerald-900/40 sticky top-0 z-40 backdrop-blur-md">
      {/* Top bar with Contacts & Language switcher */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border border-emerald-500/40 bg-slate-900 flex items-center justify-center">
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
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Admin POS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-400/80 truncate hidden xs:block leading-tight font-medium">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Actions & Language Switcher (Customer clutter stripped out) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Install PWA button (if available) */}
            {canInstall && (
              <button
                type="button"
                onClick={triggerInstall}
                aria-label={t('app.installApp')}
                title={t('app.installApp')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('app.installApp')}</span>
              </button>
            )}

            {/* Bilingual Switcher: RU | UZ */}
            <div 
              className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800" 
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
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
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
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                UZ
              </button>
            </div>
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
