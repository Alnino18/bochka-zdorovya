import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { OfflineBadge } from './components/layout/OfflineBadge';
import { PriceListView } from './components/prices/PriceListView';
import { DateNavigator } from './components/journal/DateNavigator';
import { PosOrderScreen } from './components/pos/PosOrderScreen';
import { DailySummaryCard } from './components/summary/DailySummaryCard';
import { DataManagementModal } from './components/settings/DataManagementModal';
import { getTashkentTimeString, formatTashkentDateDisplay } from './utils/date';
import { BarChart3, Database, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<NavTab>('journal');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  const [tashkentTime, setTashkentTime] = useState(() => getTashkentTimeString());
  const [tashkentDateStr, setTashkentDateStr] = useState(() => formatTashkentDateDisplay(new Date(), language));

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTashkentTime(getTashkentTimeString(now, true));
      setTashkentDateStr(formatTashkentDateDisplay(now, language));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [language]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-[#f5f5f7] flex flex-col w-full overflow-x-hidden selection:bg-emerald-500 selection:text-white dark:selection:bg-[#30d158] dark:selection:text-black transition-colors duration-200">
      {/* Offline Status Indicator */}
      <OfflineBadge />

      {/* Header with Live Tashkent Clock & Day/Night Toggle & Bilingual Switch */}
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as NavTab)} />

      {/* Main Responsive Content Shell */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* iOS Hero Card */}
        <section className="mb-6 bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 rounded-[26px] p-4 sm:p-6 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-[#30d158]/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#30d158]/15 dark:text-[#30d158] dark:border-[#30d158]/30 shadow-sm">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-[#30d158]" />
                  <span>{t('app.subtitle')}</span>
                </span>

                {/* Glowing Live Tashkent Clock Hero Badge */}
                <span
                  data-testid="app-tashkent-clock-badge"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#2c2c2e] dark:text-white/90 dark:border-white/10 shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-[#30d158] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-[#30d158]"></span>
                  </span>
                  <span>{language === 'ru' ? '🇺🇿 Ташкент:' : '🇺🇿 Тошкент:'}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-[#30d158] tracking-wider">
                    {tashkentTime}
                  </span>
                  <span className="text-slate-300 dark:text-white/30">•</span>
                  <span className="text-slate-600 dark:text-white/60">
                    {tashkentDateStr}
                  </span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('app.title')}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-white/70 mt-1 font-semibold">
                {t('app.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#30d158]/15 dark:text-[#30d158] dark:border-[#30d158]/30 font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#30d158]" />
                <span>{t('app.online')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#2c2c2e] dark:text-white/80 dark:border-white/10 font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-white/60" />
                <span>{language === 'ru' ? 'Язык: Русский' : "Til: O'zbekcha"}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Primary POS Terminal View */}
        {activeTab === 'journal' && (
          <section className="space-y-6" data-testid="section-journal">
            <DateNavigator />
            <PosOrderScreen />
          </section>
        )}

        {/* Price Catalog Reference */}
        {(activeTab === 'pricelist' || (activeTab as string) === 'prices') && (
          <PriceListView />
        )}

        {/* Financial Ledger & Backup Settings */}
        {activeTab === 'summary' && (
          <section className="space-y-6" data-testid="section-summary">
            <div className="bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-emerald-900/30 rounded-3xl p-5 shadow-sm dark:shadow-2xl transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-500/30 shadow-inner">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('journal.summarySection')}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('nav.analytics')}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDataModalOpen(true)}
                  data-testid="open-data-mgmt-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
                >
                  <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{t('nav.settings')} / Backup</span>
                </button>
              </div>

              <DailySummaryCard />
            </div>

            {isDataModalOpen && <DataManagementModal onClose={() => setIsDataModalOpen(false)} />}
          </section>
        )}
      </main>

      {/* Bottom Navigation for Mobile / Tablet Viewports */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export interface AppProps {
  initialDate?: string;
}

export const App: React.FC<AppProps> = ({ initialDate }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <StoreProvider initialDate={initialDate}>
          <AppContent />
        </StoreProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
