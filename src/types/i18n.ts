export type Language = 'ru' | 'uz';

export interface AppTranslations {
  title: string;
  subtitle: string;
  installApp: string;
  installed: string;
  offline: string;
  online: string;
}

export interface NavTranslations {
  journal: string;
  priceList: string;
  analytics: string;
  bookings: string;
  settings: string;
}

export interface PriceListTranslations {
  title: string;
  subtitle: string;
  itemNumber: string;
  serviceName: string;
  duration: string;
  price: string;
  callAction: string;
  instagramAction: string;
  contactsHeader: string;
  currencySuffix: string;
  minutesSuffix: string;
  servicesCount: string;
  searchPlaceholder: string;
  filterAll: string;
  filterPhyto: string;
  filterMassage: string;
  noResults: string;
  resetFilter: string;
  categoryBadge: string;
  orderBooking: string;
}

export interface JournalActionTranslations {
  save: string;
  saved: string;
  edit: string;
  delete: string;
  cancel: string;
  confirmDeleteDay: string;
  resetData: string;
  resetConfirm: string;
}

export interface JournalTranslations {
  title: string;
  subtitle: string;
  dateLabel: string;
  prevDay: string;
  nextDay: string;
  today: string;
  addDay: string;
  mastersSection: string;
  addMaster: string;
  masterNamePlaceholder: string;
  clientSessionsLabel: string;
  clientSessionsHelp: string;
  clientsCount: string;
  masterRevenue: string;
  masterPayout: string;
  salonShare: string;
  payoutRule: string;
  expensesSection: string;
  cleaning: string;
  otherExpenses: string;
  barSection: string;
  barRevenue: string;
  barItems: string;
  barPlaceholder: string;
  bookingsSection: string;
  addBooking: string;
  phone: string;
  time: string;
  clientName: string;
  partySize: string;
  summarySection: string;
  totalClients: string;
  grossServiceRevenue: string;
  barSales: string;
  totalGrossRevenue: string;
  totalMasterPayouts: string;
  facilityExpenses: string;
  cashDeskBalance: string;
  netSalonProfit: string;
  actions: JournalActionTranslations;
}

export interface ServiceNamesTranslations {
  cat1: string;
  cat2: string;
  cat3: string;
  cat4: string;
  cat5: string;
  cat6: string;
  cat7: string;
  cat8: string;
}

export interface PosTranslations {
  title: string;
  step1: string;
  step2: string;
  step3: string;
  selectMaster: string;
  selectService: string;
  addOrder: string;
  addOrderSuccess: string;
  orderAddedToMaster: string;
  activeShift: string;
  activeMasters: string;
  noMastersOnShift: string;
  quickAddMaster: string;
  customAmount: string;
  customAmountPlaceholder: string;
  itemizedBreakdown: string;
  massagesList: string;
  performedServices: string;
  quickBarSales: string;
  quickCleaning: string;
  clientsTotal: string;
  servicesTotal: string;
  netCash: string;
  undoOrder: string;
  durationMin: string;
}

export interface TranslationDictionary {
  app: AppTranslations;
  nav: NavTranslations;
  priceList: PriceListTranslations;
  journal: JournalTranslations;
  services: ServiceNamesTranslations;
  pos?: PosTranslations;
}

export type TranslationsRecord = Record<Language, TranslationDictionary>;

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string) => string;
}
