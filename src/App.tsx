import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Offline Status Indicator */}
      <OfflineBadge />

      {/* Header with Live Tashkent Clock & Bilingual Toggle */}
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as NavTab)} />

      {/* Main Responsive Content Shell */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Admin POS Terminal Luxury Hero Banner */}
        <section className="mb-6 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Admin Luxury POS • v5.0</span>
                </span>

                {/* Glowing Live Tashkent Clock Hero Badge */}
                <span
                  data-testid="app-tashkent-clock-badge"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 text-slate-200 border border-emerald-500/30 shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{language === 'ru' ? '🇺🇿 Ташкент:' : '🇺🇿 Тошкент:'}</span>
                  <span className="font-mono font-black text-emerald-300 tracking-wider">
                    {tashkentTime}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    {tashkentDateStr}
                  </span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {t('app.title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ru'
                  ? 'Высокоскоростной терминал заказов для администраторов, постоянный состав массажисток и учет в реальном времени'
                  : "Administratorlar uchun tezkor buyurtma terminali, doimiy massajistkalar tarkibi va real vaqtdagi kassa hisobi"}
              </p>
            </div>

            <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('app.online')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-800 font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
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

        {/* Price Catalog Reference (Admin Reference, phone/clutter removed) */}
        {(activeTab === 'pricelist' || (activeTab as string) === 'prices') && (
          <PriceListView />
        )}

        {/* Financial Ledger & Backup Settings */}
        {activeTab === 'summary' && (
          <section className="space-y-6" data-testid="section-summary">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-900/30 rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-inner">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{t('journal.summarySection')}</h3>
                    <p className="text-xs sm:text-sm text-slate-400">{t('nav.analytics')}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDataModalOpen(true)}
                  data-testid="open-data-mgmt-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all border border-slate-700 shadow-sm cursor-pointer"
                >
                  <Database className="w-4 h-4 text-teal-400" />
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
    <LanguageProvider>
      <StoreProvider initialDate={initialDate}>
        <AppContent />
      </StoreProvider>
    </LanguageProvider>
  );
};

export default App;
