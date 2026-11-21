import React, { useState } from 'react';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { OfflineBadge } from './components/layout/OfflineBadge';
import { PriceListView } from './components/prices/PriceListView';
import { DateNavigator } from './components/journal/DateNavigator';
import { MasterCard } from './components/journal/MasterCard';
import { AddMasterModal } from './components/journal/AddMasterModal';
import { FacilityExpenses } from './components/journal/FacilityExpenses';
import { BookingsSection } from './components/journal/BookingsSection';
import { AddBookingModal } from './components/journal/AddBookingModal';
import { DailySummaryCard } from './components/summary/DailySummaryCard';
import { DataManagementModal } from './components/settings/DataManagementModal';
import { BUSINESS_CONTACTS } from './constants/catalogData';
import { Users, Plus, BarChart3, Database, Phone, Instagram, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { t, language } = useTranslation();
  const { currentRecord } = useStore();
  const [activeTab, setActiveTab] = useState<NavTab>('journal');
  const [isAddMasterOpen, setIsAddMasterOpen] = useState(false);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  const masters = currentRecord?.masters || [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col w-full overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* Offline Status Indicator */}
      <OfflineBadge />

      {/* Header with Bilingual Toggle & Quick Actions */}
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as NavTab)} />

      {/* Main Responsive Content Shell */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Welcome & PWA Status Banner */}
        <section className="mb-6 bg-gradient-to-r from-teal-950/70 via-slate-800 to-slate-900 border border-teal-800/40 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
                <Sparkles className="w-3 h-3" />
                <span>PWA • Progressive Web App</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {t('app.title')}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {t('app.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('app.online')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'ru' ? 'Язык: Русский' : "Til: O'zbekcha"}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Section View Switcher based on Active Tab */}
        {activeTab === 'journal' && (
          <section className="space-y-6" data-testid="section-journal">
            <DateNavigator />
            <DailySummaryCard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-400" />
                    <span>{t('journal.mastersSection')}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddMasterOpen(true)}
                    data-testid="add-master-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('journal.addMaster')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="masters-grid">
                  {masters.length === 0 ? (
                    <div
                      className="col-span-full py-8 text-center text-slate-500 bg-slate-800/40 border border-slate-700/50 rounded-xl"
                      data-testid="empty-masters-placeholder"
                    >
                      Нет добавленных мастеров на эту дату
                    </div>
                  ) : (
                    masters.map((master) => (
                      <MasterCard key={master.id} master={master} />
                    ))
                  )}
                </div>

                <FacilityExpenses />
              </div>

              <div className="space-y-6">
                <BookingsSection onAddBookingClick={() => setIsAddBookingOpen(true)} />
              </div>
            </div>

            {isAddMasterOpen && <AddMasterModal onClose={() => setIsAddMasterOpen(false)} />}
            {isAddBookingOpen && <AddBookingModal onClose={() => setIsAddBookingOpen(false)} />}
          </section>
        )}

        {(activeTab === 'pricelist' || (activeTab as string) === 'prices') && (
          <PriceListView />
        )}

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

        {/* Contact and Booking Card */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">{t('priceList.contactsHeader')}</h4>
            <p className="text-xs text-slate-400 mt-0.5">г. Ташкент • Ежедневно с 09:00 до 23:00</p>
          </div>
          <div data-testid="contact-card-actions" className="flex flex-wrap items-center gap-3">
            <a
              href={BUSINESS_CONTACTS.phoneTelUri}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{t('priceList.callAction')}: {BUSINESS_CONTACTS.phoneDisplay}</span>
            </a>
            <a
              href={BUSINESS_CONTACTS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
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
