import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { formatCurrencyUZS, formatDuration } from '../../constants/catalogData';
import { groupMasseurOrders } from '../../utils/calculations';
import { formatDailyTelegramReport, copyReportToClipboard } from '../../utils/telegram';
import { AddMasterModal } from '../journal/AddMasterModal';
import { EditOrderModal } from './EditOrderModal';
import { TelegramReportModal } from './TelegramReportModal';
import { PriceEditorModal } from '../prices/PriceEditorModal';
import { BarEditorModal } from './BarEditorModal';
import { ServiceOrderItem, MasterEntry } from '../../types/accounting';
import {
  User,
  Users,
  Plus,
  Check,
  CheckCircle2,
  Sparkles,
  Coffee,
  DollarSign,
  TrendingUp,
  Scissors,
  Wallet,
  Clock,
  Trash2,
  Flame,
  Droplets,
  HeartPulse,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck,
  Send,
  Copy,
  Edit3,
  Settings,
} from 'lucide-react';

export const PosOrderScreen: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    selectedDate,
    currentRecord,
    summary,
    addOrder,
    removeOrder,
    deleteMaster,
    removeStaffMember,
    updateExpenses,
    addBarSale,
    updateBar,
    services,
  } = useStore();

  const masters = currentRecord?.masters || [];

  const [isBarEditorOpen, setIsBarEditorOpen] = useState(false);

  // Step 1: Selected Masseur (Massajistka)
  const [selectedMasterId, setSelectedMasterId] = useState<string>(() => {
    return masters.length > 0 ? masters[0].id : '';
  });

  const handleDeleteMaster = (master: MasterEntry) => {
    const displayName = language === 'uz' && master.nameUz ? master.nameUz : master.name;
    const confirmMsg = language === 'ru'
      ? `Удалить массажистку "${displayName}" из постоянного состава и текущей смены?`
      : `"${displayName}" massajistkani doimiy ro'yxat va smenadan butunlay o'chirishni tasdiqlaysizmi?`;

    if (window.confirm(confirmMsg)) {
      removeStaffMember(master.name);
      removeStaffMember(master.id);
      deleteMaster(selectedDate, master.id);
      if (selectedMasterId === master.id) {
        setSelectedMasterId('');
      }
    }
  };

  // Step 2: Selected Service or Custom
  interface SelectedServiceState {
    isCustom: boolean;
    categoryId?: string;
    serviceNameRu: string;
    serviceNameUz: string;
    durationMinutes: number;
    price: number;
  }

  const defaultCategory = services && services.length > 0 ? services[0] : null;
  const defaultOption = defaultCategory && defaultCategory.options.length > 0 ? defaultCategory.options[0] : null;

  const [selectedService, setSelectedService] = useState<SelectedServiceState>(() => ({
    isCustom: false,
    categoryId: defaultCategory?.id || 'cat-1',
    serviceNameRu: defaultCategory?.nameRu || 'Фитобочка, Сауна, Массаж (оздоровительный)',
    serviceNameUz: defaultCategory?.nameUz || "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)",
    durationMinutes: defaultOption?.durationMinutes || 40,
    price: defaultOption?.priceUZS || 300000,
  }));

  const [customPriceInput, setCustomPriceInput] = useState<string>('350000');
  const [isAddMasterModalOpen, setIsAddMasterModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isPriceEditorModalOpen, setIsPriceEditorModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<{
    order: ServiceOrderItem;
    master: MasterEntry;
  } | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Quick Bar & Cleaning inputs
  const [quickBarInput, setQuickBarInput] = useState<string>(
    currentRecord?.bar?.revenue ? String(currentRecord.bar.revenue) : ''
  );
  const [cleaningInput, setCleaningInput] = useState<string>(
    currentRecord?.expenses?.cleaning ? String(currentRecord.expenses.cleaning) : ''
  );

  React.useEffect(() => {
    setCleaningInput(currentRecord?.expenses?.cleaning ? String(currentRecord.expenses.cleaning) : '');
    setQuickBarInput(currentRecord?.bar?.revenue ? String(currentRecord.bar.revenue) : '');
  }, [selectedDate, currentRecord?.expenses?.cleaning, currentRecord?.bar?.revenue]);

  // Ensure selected master exists in current record
  const activeMaster = masters.find((m) => m.id === selectedMasterId) || masters[0] || null;

  // Category Icon helper
  const getCategoryIcon = (categoryNumber: number) => {
    switch (categoryNumber) {
      case 1:
        return <Flame className="w-4 h-4 text-emerald-400" />;
      case 2:
        return <Droplets className="w-4 h-4 text-teal-400" />;
      case 3:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 4:
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 5:
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 6:
        return <HeartPulse className="w-4 h-4 text-red-400" />;
      case 7:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 8:
        return <Layers className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  // Step 3: Handle instant order submission
  const handleAddOrder = () => {
    if (!activeMaster) {
      return;
    }

    const price = selectedService.isCustom
      ? Number(customPriceInput) || 350000
      : selectedService.price;

    const serviceName = language === 'uz' ? selectedService.serviceNameUz : selectedService.serviceNameRu;

    addOrder(selectedDate, activeMaster.id, {
      categoryId: selectedService.categoryId,
      serviceName: selectedService.serviceNameRu,
      serviceNameUz: selectedService.serviceNameUz,
      durationMinutes: selectedService.durationMinutes,
      price,
    });

    const masterDisplayName = language === 'uz' && activeMaster.nameUz ? activeMaster.nameUz : activeMaster.name;
    const msg =
      language === 'ru'
        ? `Заказ оформлен: ${masterDisplayName} — ${serviceName} (${formatCurrencyUZS(price, 'ru')})`
        : `Buyurtma qabul qilindi: ${masterDisplayName} — ${serviceName} (${formatCurrencyUZS(price, 'uz')})`;

    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  };

  // Quick Bar preset tap
  const handleAddBarPreset = (amount: number, nameRu: string, nameUz: string) => {
    const itemName = language === 'uz' ? nameUz : nameRu;
    addBarSale(selectedDate, amount, itemName);
    setSuccessBanner(
      language === 'ru'
        ? `Бар: добавлено ${itemName} (+${formatCurrencyUZS(amount, 'ru')})`
        : `Bar: ${itemName} qo'shildi (+${formatCurrencyUZS(amount, 'uz')})`
    );
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  // Quick Bar custom add
  const handleAddBarCustom = () => {
    const amount = Number(quickBarInput) || 0;
    if (amount > 0) {
      addBarSale(selectedDate, amount, language === 'ru' ? 'Барный заказ' : 'Bar buyurtmasi');
      setQuickBarInput('');
      setSuccessBanner(
        language === 'ru'
          ? `Бар: добавлено +${formatCurrencyUZS(amount, 'ru')}`
          : `Bar: +${formatCurrencyUZS(amount, 'uz')} qo'shildi`
      );
      setTimeout(() => setSuccessBanner(null), 3000);
    }
  };

  // Quick Cleaning update
  const handleSetCleaning = (amount: number) => {
    updateExpenses(selectedDate, { cleaning: amount });
    setCleaningInput(String(amount));
    setSuccessBanner(
      language === 'ru'
        ? `Уборка: зафиксировано ${formatCurrencyUZS(amount, 'ru')}`
        : `Tozalash: ${formatCurrencyUZS(amount, 'uz')} belgilandi`
    );
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleCleaningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    setCleaningInput(e.target.value);
    updateExpenses(selectedDate, { cleaning: val });
  };

  const handleBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 0;
    setQuickBarInput(e.target.value);
    updateBar(selectedDate, { revenue: val });
  };

  // Instant Copy Daily Report
  const handleCopyReport = async () => {
    const report = formatDailyTelegramReport(currentRecord, summary, language);
    const ok = await copyReportToClipboard(report.plainText);
    if (ok) {
      setSuccessBanner(
        language === 'ru'
          ? 'Отчет скопирован в буфер обмена!'
          : 'Hisobot buferga muvaffaqiyatli nusxalandi!'
      );
      setTimeout(() => setSuccessBanner(null), 3000);
    }
  };

  return (
    <div className="space-y-6" data-testid="pos-order-terminal">
      {/* Success / Feedback Toast Banner */}
      {successBanner && (
        <div
          data-testid="pos-order-success-banner"
          className="fixed top-16 right-4 sm:right-6 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-extrabold text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/50 animate-bounce"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Main Luxury iOS Station Card */}
      <div className="bg-[#1c1c1e] border border-white/10 rounded-[26px] p-4 sm:p-6 shadow-2xl space-y-6">
        
        {/* Terminal Header & Prominent Quick Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[16px] bg-[#30d158]/20 text-[#30d158] flex items-center justify-center border border-[#30d158]/30 shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80 border border-white/10">
                <ShieldCheck className="w-3 h-3 text-[#30d158]" />
                <span>Бочка Здоровья</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('pos.title')}
              </h2>
            </div>
          </div>

          {/* Prominent Glowing Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Button 1: ✈️ Телеграмга юбориш */}
            <button
              type="button"
              onClick={() => setIsTelegramModalOpen(true)}
              data-testid="send-telegram-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[16px] bg-[#0a84ff] hover:bg-[#0071e3] text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              title={language === 'ru' ? 'Отправить отчет в Telegram' : 'Hisobotni Telegramga yuborish'}
            >
              <Send className="w-4 h-4" />
              <span>✈️ {language === 'ru' ? 'В Telegram' : 'Телеграмга юбориш'}</span>
            </button>

            {/* Quick Button 2: ⚙️ Прейскурант */}
            <button
              type="button"
              onClick={() => setIsPriceEditorModalOpen(true)}
              data-testid="open-price-editor-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[16px] bg-[#ffd60a] hover:bg-[#ffdf33] text-black font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              title={language === 'ru' ? 'Редактировать прейскурант' : 'Preyskurantni tahrirlash'}
            >
              <Settings className="w-4 h-4" />
              <span>⚙️ {language === 'ru' ? 'Прейскурант' : 'Прейскурант'}</span>
            </button>

            {/* Quick Button 3: 👥 Массажисткалар */}
            <button
              type="button"
              onClick={() => setIsAddMasterModalOpen(true)}
              data-testid="quick-massajistkas-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[16px] bg-[#30d158] hover:bg-[#28b84d] text-black font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              title={language === 'ru' ? 'Массажистки' : 'Массажисткалар'}
            >
              <Users className="w-4 h-4" />
              <span>👥 {language === 'ru' ? 'Массажистки' : 'Массажисткалар'}</span>
            </button>

            {/* Quick Button 4: 🍹 Бар */}
            <button
              type="button"
              onClick={() => setIsBarEditorOpen(true)}
              data-testid="quick-bar-editor-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[16px] bg-[#ff9f0a] hover:bg-[#e08900] text-black font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              title={language === 'ru' ? 'Редактировать бар' : 'Barni tahrirlash'}
            >
              <Coffee className="w-4 h-4" />
              <span>🍹 {language === 'ru' ? 'Бар' : 'Bar'}</span>
            </button>

            {/* Quick Copy Report Button */}
            <button
              type="button"
              onClick={handleCopyReport}
              data-testid="copy-report-btn"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[16px] bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white/90 hover:text-white font-bold text-xs transition-all border border-white/10 cursor-pointer shadow-sm active:scale-95"
              title={language === 'ru' ? 'Скопировать отчет' : 'Hisobotdan nusxa olish'}
            >
              <Copy className="w-3.5 h-3.5 text-white/80" />
              <span>{language === 'ru' ? 'Копия' : 'Nusxa'}</span>
            </button>

            {/* Shift Snapshot Stats Badges */}
            <div className="flex items-center gap-2 ml-auto lg:ml-0 text-xs">
              <div className="px-3 py-1.5 rounded-[14px] bg-[#2c2c2e] border border-white/5 text-white/80 shadow-inner">
                <span className="text-white/50 mr-1.5">{t('pos.activeMasters')}:</span>
                <span className="font-bold text-white" data-testid="pos-active-masters-count">
                  {masters.length}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-[14px] bg-[#2c2c2e] border border-white/5 text-white/80 shadow-inner">
                <span className="text-white/50 mr-1.5">{t('journal.totalClients')}:</span>
                <span className="font-bold text-[#30d158]" data-testid="pos-header-clients-count">
                  {summary.totalClients}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: SELECT MASSAJISTKA */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#30d158] flex items-center gap-2">
              <span className="w-6 h-6 rounded-[8px] bg-[#30d158]/20 text-[#30d158] flex items-center justify-center text-xs font-black border border-[#30d158]/30">
                1
              </span>
              <span>{t('pos.step1')}</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-medium hidden sm:inline">
                {masters.length} {language === 'ru' ? 'массажисток готово' : 'massajistka tayyor'}
              </span>
              <button
                type="button"
                onClick={() => setIsAddMasterModalOpen(true)}
                data-testid="add-master-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-[#30d158] hover:bg-[#28b84d] text-black text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t('pos.quickAddMaster')}</span>
              </button>
            </div>
          </div>

          {masters.length === 0 ? (
            <div
              data-testid="pos-no-masters"
              className="p-6 text-center text-white/50 bg-[#2c2c2e] border border-white/5 rounded-[22px]"
            >
              <p className="text-sm">{t('pos.noMastersOnShift')}</p>
              <button
                type="button"
                onClick={() => setIsAddMasterModalOpen(true)}
                className="mt-3 px-4 py-2 bg-[#30d158] hover:bg-[#28b84d] text-black text-xs font-bold rounded-[14px] shadow-md cursor-pointer"
              >
                {t('pos.quickAddMaster')}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Massajistkas">
              {masters.map((master) => {
                const isSelected = activeMaster?.id === master.id;
                const displayName = language === 'uz' && master.nameUz ? master.nameUz : master.name;
                return (
                  <div key={master.id} className="relative group">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedMasterId(master.id)}
                      data-testid={`pos-masseur-chip-${master.id}`}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-[20px] font-bold transition-all border cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'bg-[#2c2c2e] text-white border-white/20 shadow-xl ring-2 ring-[#30d158]/50 scale-102'
                          : 'bg-[#1c1c1e] hover:bg-[#252528] text-white/90 border-white/10 shadow-md'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-[14px] flex items-center justify-center font-black text-sm shadow-inner transition-colors flex-shrink-0 ${
                          isSelected
                            ? 'bg-[#30d158] text-black font-extrabold'
                            : 'bg-[#2c2c2e] text-[#30d158] border border-white/10'
                        }`}
                      >
                        {isSelected ? <Check className="w-5 h-5 stroke-[3]" /> : displayName.charAt(0)}
                      </div>
                      <div className="flex flex-col items-start text-left min-w-0 pr-4">
                        <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
                          {displayName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            data-testid={`pos-masseur-chip-clients-${master.id}`}
                            className={`text-[11px] px-2 py-0.5 rounded-[8px] font-bold ${
                              isSelected
                                ? 'bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/30'
                                : 'bg-[#2c2c2e] text-white/60 border border-white/5'
                            }`}
                          >
                            {master.clientCount} {language === 'ru' ? 'кл' : 'mijoz'}
                          </span>
                          <span
                            data-testid={`pos-masseur-chip-revenue-${master.id}`}
                            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-[8px] ${
                              isSelected
                                ? 'bg-[#30d158]/25 text-[#30d158] border border-[#30d158]/40'
                                : 'bg-[#2c2c2e] text-[#30d158] border border-white/5'
                            }`}
                          >
                            {formatCurrencyUZS(master.revenue, language)}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Delete Massajistka Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMaster(master);
                      }}
                      data-testid={`delete-masseur-btn-${master.id}`}
                      aria-label={language === 'ru' ? `Удалить ${displayName}` : `${displayName}ni o'chirish`}
                      title={language === 'ru' ? `Удалить ${displayName}` : `${displayName}ni o'chirish`}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#ff453a] hover:bg-red-500 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer border border-white/20 z-10"
                    >
                      <Trash2 className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 2: SELECT SERVICE FROM MENU */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#30d158] flex items-center gap-2">
              <span className="w-6 h-6 rounded-[8px] bg-[#30d158]/20 text-[#30d158] flex items-center justify-center text-xs font-black border border-[#30d158]/30">
                2
              </span>
              <span>{t('pos.step2')}</span>
            </h3>
            <span className="text-xs text-white/50">
              {services.length} {language === 'ru' ? 'категорий услуг' : 'toifalar'}
            </span>
          </div>

          {/* Touch-Friendly Grid of Service Categories (Dynamic from Store) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {services.map((category) => {
              const catTitle = language === 'uz' ? category.nameUz : category.nameRu;

              return (
                <div
                  key={category.id}
                  data-testid={`pos-service-category-${category.categoryNumber}`}
                  className="bg-[#1c1c1e] border border-white/10 hover:border-white/20 rounded-[20px] p-3.5 flex flex-col justify-between space-y-3 transition-all shadow-md"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-[14px] bg-[#2c2c2e] border border-white/10 flex-shrink-0 shadow-inner">
                      {getCategoryIcon(category.categoryNumber)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase text-white/40 tracking-wider">
                        #{category.categoryNumber}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">
                        {catTitle}
                      </h4>
                    </div>
                  </div>

                  {/* Options Duration / Price Buttons */}
                  <div className="grid grid-cols-1 gap-2 pt-1 border-t border-white/10">
                    {category.options.map((option) => {
                      const isOptionSelected =
                        !selectedService.isCustom &&
                        selectedService.categoryId === category.id &&
                        selectedService.durationMinutes === option.durationMinutes &&
                        selectedService.price === option.priceUZS;

                      return (
                        <button
                          key={`${category.id}-${option.durationMinutes}-${option.priceUZS}`}
                          type="button"
                          onClick={() => {
                            setSelectedService({
                              isCustom: false,
                              categoryId: category.id,
                              serviceNameRu: category.nameRu,
                              serviceNameUz: category.nameUz,
                              durationMinutes: option.durationMinutes,
                              price: option.priceUZS,
                            });
                          }}
                          data-testid={`pos-service-btn-${category.categoryNumber}-${option.durationMinutes}`}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[14px] text-xs font-bold transition-all border cursor-pointer active:scale-98 ${
                            isOptionSelected
                              ? 'bg-[#30d158] text-black font-extrabold border-white/20 shadow-lg ring-2 ring-[#30d158]/60'
                              : 'bg-[#2c2c2e] text-white/90 hover:text-white hover:bg-[#3a3a3c] border-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock className={`w-3.5 h-3.5 ${isOptionSelected ? 'text-black' : 'text-[#30d158]'}`} />
                            <span>{formatDuration(option.durationMinutes, language)}</span>
                          </span>
                          <span className={`font-mono font-bold ${isOptionSelected ? 'text-black' : 'text-[#30d158]'}`}>
                            {formatCurrencyUZS(option.priceUZS, language)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Amount Option */}
          <div className="bg-[#1c1c1e] border border-white/10 rounded-[20px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedService({
                    isCustom: true,
                    categoryId: 'cat-custom',
                    serviceNameRu: 'Произвольный сеанс массажа',
                    serviceNameUz: 'Boshqa massaj seansi',
                    durationMinutes: 40,
                    price: Number(customPriceInput) || 350000,
                  });
                }}
                data-testid="pos-custom-amount-btn"
                className={`px-4 py-2 rounded-[14px] text-xs font-bold border transition-all cursor-pointer shadow-sm active:scale-95 ${
                  selectedService.isCustom
                    ? 'bg-[#ffd60a] text-black font-extrabold border-white/20 shadow-md ring-2 ring-[#ffd60a]/50'
                    : 'bg-[#2c2c2e] text-[#ffd60a] hover:text-white hover:bg-[#3a3a3c] border-white/5'
                }`}
              >
                <span>{t('pos.customAmount')}</span>
              </button>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[100000, 200000, 250000, 300000, 350000, 370000, 500000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCustomPriceInput(String(preset));
                      setSelectedService({
                        isCustom: true,
                        categoryId: 'cat-custom',
                        serviceNameRu: `Произвольный сеанс (${formatCurrencyUZS(preset, 'ru')})`,
                        serviceNameUz: `Shaxsiy seans (${formatCurrencyUZS(preset, 'uz')})`,
                        durationMinutes: 40,
                        price: preset,
                      });
                    }}
                    className="px-2.5 py-1 rounded-[10px] bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[11px] font-mono font-bold text-white/80 border border-white/5 cursor-pointer transition-all active:scale-95"
                  >
                    {preset / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-bold">UZS:</span>
              <input
                type="number"
                value={customPriceInput}
                onChange={(e) => {
                  setCustomPriceInput(e.target.value);
                  if (selectedService.isCustom) {
                    setSelectedService((prev) => ({
                      ...prev,
                      price: Number(e.target.value) || 0,
                    }));
                  }
                }}
                data-testid="pos-custom-amount-input"
                placeholder={t('pos.customAmountPlaceholder')}
                className="w-36 px-3 py-1.5 bg-[#2c2c2e] border border-white/10 rounded-[12px] text-xs font-mono font-bold text-white focus:outline-none focus:border-[#ffd60a]"
              />
            </div>
          </div>
        </div>

        {/* STEP 3: ACTION BAR / QABUL QILISH */}
        <div className="pt-3 border-t border-white/10">
          <div className="bg-[#2c2c2e] border border-white/10 rounded-[22px] p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Draft Summary */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#30d158] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                <span>{t('pos.step3')}:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white">
                <span className="text-white/50">{t('pos.selectedMaster')}:</span>
                <span
                  data-testid="pos-draft-master-name"
                  className="font-bold text-[#30d158] bg-[#30d158]/15 px-2.5 py-1 rounded-[10px] border border-[#30d158]/30"
                >
                  {activeMaster
                    ? language === 'uz' && activeMaster.nameUz
                      ? activeMaster.nameUz
                      : activeMaster.name
                    : language === 'ru'
                    ? 'Массажистка не выбрана'
                    : 'Massajistka tanlanmagan'}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/50">{t('pos.selectedService')}:</span>
                <span
                  data-testid="pos-draft-service-name"
                  className="font-semibold text-white bg-[#1c1c1e] px-2.5 py-1 rounded-[10px] border border-white/10"
                >
                  {language === 'uz' ? selectedService.serviceNameUz : selectedService.serviceNameRu}{' '}
                  ({formatDuration(selectedService.durationMinutes, language)})
                </span>
              </div>
            </div>

            {/* Instant Add Order Button */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  {t('priceList.price')}:
                </div>
                <div
                  data-testid="pos-draft-price"
                  className="font-mono text-xl sm:text-2xl md:text-3xl font-extrabold text-[#30d158]"
                >
                  {formatCurrencyUZS(
                    selectedService.isCustom
                      ? Number(customPriceInput) || 350000
                      : selectedService.price,
                    language
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={!activeMaster}
                onClick={handleAddOrder}
                data-testid="pos-submit-order"
                className={`inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-[18px] font-extrabold text-sm tracking-wide shadow-2xl transition-all select-none cursor-pointer ${
                  activeMaster
                    ? 'bg-[#30d158] hover:bg-[#28b84d] active:scale-95 text-black shadow-lg shadow-[#30d158]/30'
                    : 'bg-[#2c2c2e] text-white/30 cursor-not-allowed opacity-50'
                }`}
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{t('pos.addOrder')}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK BAR & CLEANING LOGGING SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Bar Card */}
        <div
          data-testid="pos-quick-bar-card"
          className="bg-[#1c1c1e] border border-white/10 rounded-[24px] p-4 sm:p-5 shadow-xl space-y-3.5 backdrop-blur-md"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#ffd60a] flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              <span>{t('pos.quickBarSales')}</span>
            </h4>
            <div className="flex items-center gap-2">
              <span
                data-testid="pos-bar-current-total"
                className="text-xs font-mono font-bold text-[#ffd60a] bg-[#ffd60a]/15 px-2.5 py-1 rounded-[12px] border border-[#ffd60a]/30"
              >
                {formatCurrencyUZS(currentRecord?.bar?.revenue || 0, language)}
              </span>
              <button
                type="button"
                onClick={() => setIsBarEditorOpen(true)}
                data-testid="open-bar-editor-btn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] bg-[#ffd60a] hover:bg-[#ffdf33] text-black text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{language === 'ru' ? 'Редактировать' : 'Tahrirlash'}</span>
              </button>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { amount: 10000, ru: 'Вода 10k', uz: 'Suv 10k' },
              { amount: 20000, ru: 'Чай 20k', uz: 'Choy 20k' },
              { amount: 30000, ru: 'Кофе 30k', uz: 'Kofe 30k' },
              { amount: 50000, ru: 'Напиток 50k', uz: 'Ichimlik 50k' },
            ].map((item) => (
              <button
                key={item.amount}
                type="button"
                onClick={() => handleAddBarPreset(item.amount, item.ru, item.uz)}
                data-testid={`pos-quick-bar-btn-${item.amount}`}
                className="px-2.5 py-2.5 rounded-[14px] bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-white/5 text-xs font-bold text-[#ffd60a] transition-all shadow-sm cursor-pointer active:scale-95"
              >
                + {language === 'uz' ? item.uz : item.ru}
              </button>
            ))}
          </div>

          {/* Custom bar amount input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="number"
              value={quickBarInput}
              onChange={handleBarChange}
              placeholder={language === 'ru' ? 'Сумма бара (UZS)' : "Bar summasi (so'm)"}
              data-testid="input-bar-revenue"
              className="flex-1 px-3.5 py-2 bg-[#2c2c2e] border border-white/10 rounded-[14px] text-xs text-white focus:outline-none focus:border-[#ffd60a] font-mono"
            />
            <button
              type="button"
              onClick={handleAddBarCustom}
              data-testid="pos-quick-bar-submit-btn"
              className="px-4 py-2 rounded-[14px] bg-[#ffd60a] hover:bg-[#ffdf33] text-black text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              + {language === 'ru' ? 'Добавить' : "Qo'shish"}
            </button>
          </div>
        </div>

        {/* Quick Cleaning / Facility Expense Card */}
        <div
          data-testid="pos-quick-cleaning-card"
          className="bg-[#1c1c1e] border border-white/10 rounded-[24px] p-4 sm:p-5 shadow-xl space-y-3.5 backdrop-blur-md"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{t('pos.quickCleaning')}</span>
            </h4>
            <span
              data-testid="pos-cleaning-current-total"
              className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded-[12px] border border-rose-500/20"
            >
              {formatCurrencyUZS(currentRecord?.expenses?.cleaning || 0, language)}
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[200000, 150000, 100000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleSetCleaning(amt)}
                data-testid={`pos-quick-cleaning-preset-${amt}`}
                className="px-2.5 py-2.5 rounded-[14px] bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-white/5 text-xs font-bold text-rose-300 hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
              >
                {amt / 1000}k UZS
              </button>
            ))}
          </div>

          {/* Custom cleaning input */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
              {language === 'ru' ? 'Уборка:' : 'Tozalash:'}
            </span>
            <input
              id="input-cleaning"
              type="number"
              value={cleaningInput}
              onChange={handleCleaningChange}
              data-testid="input-cleaning-expense"
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* LIVE POS DAILY BREAKDOWN SECTION */}
      <section className="space-y-4" data-testid="pos-daily-breakdown-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-black text-white tracking-tight">
              {t('pos.itemizedBreakdown')}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {masters.length} {language === 'ru' ? 'массажисток на смене' : 'massajistkalar smenada'}
          </span>
        </div>

        {/* Masseurs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="masters-grid">
          {masters.length === 0 ? (
            <div
              data-testid="empty-masters-placeholder"
              className="col-span-full py-8 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl"
            >
              {language === 'ru'
                ? 'Нет активных массажисток на текущую смену'
                : "Joriy smena uchun faol massajistkalar yo'q"}
            </div>
          ) : (
            masters.map((master) => {
              const displayName = language === 'uz' && master.nameUz ? master.nameUz : master.name;
              const groupedOrders = groupMasseurOrders(master, language);

              return (
                <div
                  key={master.id}
                  data-testid={`master-card-${master.id}`}
                  className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-3.5 transition-all backdrop-blur-md"
                >
                  {/* Masseur Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30 shadow-inner">
                        {displayName.charAt(0)}
                      </div>
                      <div>
                        <h4
                          data-testid={`master-name-${master.id}`}
                          className="text-sm sm:text-base font-black text-white"
                        >
                          {displayName}
                        </h4>
                        <div
                          data-testid={`master-clients-${master.id}`}
                          className="text-xs font-bold text-emerald-300"
                        >
                          {master.clientCount} {language === 'ru' ? 'клиентов' : 'mijoz'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMaster(master)}
                      data-testid={`delete-master-btn-${master.id}`}
                      title={t('journal.actions.delete')}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Itemized List of Massages Performed */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {t('pos.performedServices')}:
                    </div>

                    {groupedOrders.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-1">
                        {t('pos.noOrdersYet')}
                      </div>
                    ) : (
                      <div
                        data-testid={`pos-masseur-massages-${master.id}`}
                        className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80"
                      >
                        {groupedOrders.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between text-xs py-0.5"
                          >
                            <span className="font-medium text-slate-200">
                              <span className="font-extrabold text-emerald-400 mr-1.5">
                                {item.count}x
                              </span>
                              <span>
                                {item.serviceName}
                                {item.durationMinutes > 0
                                  ? ` (${formatDuration(item.durationMinutes, language)})`
                                  : ''}
                              </span>
                            </span>
                            <span className="font-mono text-slate-400 text-[11px] ml-2">
                              {formatCurrencyUZS(item.totalPrice, language)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown: Revenue, Payout, Salon Share */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">
                        {t('journal.masterRevenue')}
                      </div>
                      <div
                        data-testid={`master-revenue-${master.id}`}
                        className="font-mono font-bold text-emerald-300 mt-0.5 text-xs truncate"
                      >
                        {formatCurrencyUZS(master.revenue, language)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">
                        {t('journal.masterPayout')}
                      </div>
                      <div
                        data-testid={`master-payout-${master.id}`}
                        className="font-mono font-bold text-indigo-300 mt-0.5 text-xs truncate"
                      >
                        {formatCurrencyUZS(master.payout, language)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">
                        {t('journal.salonShare')}
                      </div>
                      <div
                        data-testid={`master-salon-share-${master.id}`}
                        className="font-mono font-bold text-teal-300 mt-0.5 text-xs truncate"
                      >
                        {formatCurrencyUZS(master.salonShare, language)}
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders List with Edit and Undo Options */}
                  {master.orders && master.orders.length > 0 && (
                    <div className="pt-1">
                      <details className="text-xs group">
                        <summary className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                          {language === 'ru' ? 'История заказов смены (' : 'Smena buyurtmalari ('}
                          {master.orders.length})
                        </summary>
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                          {master.orders.map((ord) => (
                            <div
                              key={ord.id}
                              className="flex items-center justify-between bg-slate-950/80 px-2.5 py-2 rounded-xl border border-slate-800 text-[11px] gap-2"
                            >
                              <div className="truncate flex-1">
                                {ord.timestamp && (
                                  <span className="text-slate-500 mr-1 font-mono text-[10px]">
                                    {ord.timestamp}
                                  </span>
                                )}
                                <span className="text-slate-300 font-medium">
                                  {language === 'uz' && ord.serviceNameUz
                                    ? ord.serviceNameUz
                                    : ord.serviceName}
                                </span>
                                {ord.barItems && ord.barItems.length > 0 && (
                                  <span className="ml-1 text-[10px] text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-500/20">
                                    +{ord.barItems.length}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="font-mono font-bold text-emerald-400">
                                  {formatCurrencyUZS(ord.price, language)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingOrder({ order: ord, master })}
                                  data-testid={`edit-order-btn-${ord.id}`}
                                  title={language === 'ru' ? 'Редактировать заказ' : 'Buyurtmani tahrirlash'}
                                  className="text-slate-400 hover:text-emerald-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeOrder(selectedDate, master.id, ord.id)}
                                  title={t('pos.undoOrder')}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* SALON NET SUMMARY CARD */}
      <section
        data-testid="daily-summary-card"
        className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-md"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              {t('journal.summarySection')}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {summary.totalClients} {language === 'ru' ? 'клиентов' : 'mijoz'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Total Clients */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('pos.clientsTotal')}</span>
            </div>
            <div
              data-testid="metric-total-clients"
              className="text-xl font-black text-white mt-1"
            >
              {summary.totalClients}
            </div>
          </div>

          {/* Gross Service Revenue */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('journal.grossServiceRevenue')}</span>
            </div>
            <div
              data-testid="metric-gross-service-revenue"
              className="text-sm font-black text-emerald-300 mt-1 truncate font-mono"
            >
              {formatCurrencyUZS(summary.grossServiceRevenue, language)}
            </div>
          </div>

          {/* Bar Sales */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('journal.barSales')}</span>
            </div>
            <div
              data-testid="metric-bar-revenue"
              className="text-sm font-black text-amber-300 mt-1 truncate font-mono"
            >
              {formatCurrencyUZS(summary.barRevenue, language)}
            </div>
          </div>

          {/* Gross Total Revenue */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('journal.totalGrossRevenue')}</span>
            </div>
            <div
              data-testid="metric-gross-total-revenue"
              className="text-sm font-black text-cyan-300 mt-1 truncate font-mono"
            >
              {formatCurrencyUZS(summary.grossTotalRevenue, language)}
            </div>
          </div>

          {/* Cleaning Expense */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('journal.cleaning')}</span>
            </div>
            <div
              data-testid="metric-cleaning-expenses"
              className="text-sm font-black text-rose-300 mt-1 truncate font-mono"
            >
              {formatCurrencyUZS(summary.cleaningExpenses, language)}
            </div>
          </div>

          {/* Masseur Payouts */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('journal.totalMasterPayouts')}</span>
            </div>
            <div
              data-testid="metric-master-payouts"
              className="text-sm font-black text-indigo-300 mt-1 truncate font-mono"
            >
              {formatCurrencyUZS(summary.totalMasterPayouts, language)}
            </div>
          </div>

          {/* Cash In Register (Gross Total - Cleaning) */}
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3 bg-gradient-to-br from-emerald-950/30 to-slate-950 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase text-emerald-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('pos.netCash')}</span>
            </div>
            <div
              data-testid="metric-net-balance"
              className="text-base font-black text-emerald-400 mt-1 truncate font-mono"
            >
              {formatCurrencyUZS(summary.netBalance, language)}
            </div>
          </div>
        </div>

        {/* Bottom Banner: Net Salon Profit */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-white mr-1.5">{t('journal.netSalonProfit')}:</span>
            <span>
              {language === 'ru'
                ? 'Остаток в кассе за вычетом выплат массажисткам'
                : "Massajistkalarga to'langan summani chegirgandagi sof foyda"}
            </span>
          </div>

          <div
            data-testid="metric-net-profit"
            className="font-mono text-lg sm:text-xl font-black text-emerald-300"
          >
            {formatCurrencyUZS(summary.netSalonProfit, language)}
          </div>
        </div>
      </section>

      {/* Add Master (Massajistka) Modal */}
      {isAddMasterModalOpen && (
        <AddMasterModal onClose={() => setIsAddMasterModalOpen(false)} />
      )}

      {/* Price Editor Modal */}
      {isPriceEditorModalOpen && (
        <PriceEditorModal onClose={() => setIsPriceEditorModalOpen(false)} />
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder.order}
          currentMaster={editingOrder.master}
          onClose={() => setEditingOrder(null)}
          onSaved={(msg) => {
            setSuccessBanner(msg);
            setTimeout(() => setSuccessBanner(null), 4000);
          }}
        />
      )}

      {/* Telegram Daily Report Modal */}
      {isTelegramModalOpen && (
        <TelegramReportModal onClose={() => setIsTelegramModalOpen(false)} />
      )}

      {/* Bar Editor Modal */}
      {isBarEditorOpen && (
        <BarEditorModal onClose={() => setIsBarEditorOpen(false)} />
      )}
    </div>
  );
};
