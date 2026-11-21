import React from 'react';
import { Phone, Instagram, Download } from 'lucide-react';
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
    <header className="bg-slate-900 text-white shadow-md border-b border-teal-800/40 sticky top-0 z-40">
      {/* Top bar with Contacts & Language switcher */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-teal-400/40 bg-slate-900 flex items-center justify-center">
              <img 
                src="./icons/icon.svg" 
                alt="Бочка Здоровья" 
                width="40"
                height="40"
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white truncate leading-tight">
                {t('app.title')}
              </h1>
              <p className="text-[10px] sm:text-xs text-teal-300/80 truncate hidden xs:block leading-tight">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Actions & Language Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Install PWA button (if available) */}
            {canInstall && (
              <button
                type="button"
                onClick={triggerInstall}
                aria-label={t('app.installApp')}
                title={t('app.installApp')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('app.installApp')}</span>
              </button>
            )}

            {/* Quick Contact Buttons */}
            <a
              href="tel:+998970020404"
              data-testid="header-phone-link"
              aria-label={`${t('priceList.callAction')}: +998 97 002-04-04`}
              title={`${t('priceList.callAction')}: +998 97 002-04-04`}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors text-xs font-medium gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[11px]">+998 97 002-04-04</span>
            </a>

            <a
              href="https://instagram.com/Bochka_zdorovya"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="header-instagram-link"
              aria-label="Instagram @Bochka_zdorovya"
              title="Instagram @Bochka_zdorovya"
              className="inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 transition-colors text-xs font-medium gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">@Bochka_zdorovya</span>
            </a>

            {/* Bilingual Switcher: RU | UZ */}
            <div 
              className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700" 
              role="group" 
              aria-label="Language selection"
              data-testid="language-toggle"
            >
              <button
                type="button"
                onClick={() => setLanguage('ru')}
                data-testid="lang-btn-ru"
                aria-pressed={language === 'ru'}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  language === 'ru'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RU
              </button>
              <span className="text-slate-600 text-xs select-none">|</span>
              <button
                type="button"
                onClick={() => setLanguage('uz')}
                data-testid="lang-btn-uz"
                aria-pressed={language === 'uz'}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  language === 'uz'
                    ? 'bg-teal-600 text-white shadow-sm'
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
          <nav className="hidden md:flex items-center space-x-1 py-1.5 border-t border-slate-800/80" aria-label="Desktop Navigation">
            <button
              type="button"
              onClick={() => onTabChange('journal')}
              aria-current={activeTab === 'journal' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'journal'
                  ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t('nav.journal')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('pricelist')}
              aria-current={activeTab === 'pricelist' || activeTab === 'prices' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'pricelist' || activeTab === 'prices'
                  ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t('nav.priceList')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('summary')}
              aria-current={activeTab === 'summary' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
