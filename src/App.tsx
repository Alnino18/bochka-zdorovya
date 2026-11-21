import React, { useState } from 'react';
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
import { BarChart3, Database, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<NavTab>('journal');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Offline Status Indicator */}
      <OfflineBadge />

      {/* Header with Bilingual Toggle & Admin Title (Customer clutter stripped out) */}
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as NavTab)} />

      {/* Main Responsive Content Shell */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Admin POS Terminal Status Banner */}
        <section className="mb-6 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Admin Luxury POS Terminal • Fast Flow</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {t('app.title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                {language === 'ru'
                  ? 'Высокоскоростной терминал заказов для администраторов и кассовый учет'
                  : 'Administratorlar uchun tezkor buyurtma terminali va kassa hisobi'}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-700/50 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('app.online')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
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
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('journal.summarySection')}</h3>
                    <p className="text-xs sm:text-sm text-slate-400">{t('nav.analytics')}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDataModalOpen(true)}
                  data-testid="open-data-mgmt-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors"
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

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </LanguageProvider>
  );
};

export default App;
