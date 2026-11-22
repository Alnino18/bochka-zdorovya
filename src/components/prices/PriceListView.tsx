import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Clock,
  Tag,
  CheckCircle2,
  Filter,
  Edit3,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import {
  BUSINESS_CONTACTS,
  SERVICE_CATEGORIES,
  formatDuration,
  formatCurrencyUZS,
} from '../../constants/catalogData';
import { ServiceCategory } from '../../types/catalog';
import { PriceEditorModal } from './PriceEditorModal';

type DurationFilter = 'all' | 40 | 60;
type GroupFilter = 'all' | 'phyto' | 'massage';

interface PriceListViewProps {
  categories?: ServiceCategory[];
}

export const PriceListView: React.FC<PriceListViewProps> = ({
  categories: propCategories,
}) => {
  const { language, t } = useTranslation();

  let storeServices: ServiceCategory[] | undefined;
  let hasStore = false;
  try {
    const store = useStore();
    storeServices = store.services;
    hasStore = true;
  } catch {
    storeServices = undefined;
    hasStore = false;
  }
  const categories = propCategories || storeServices || SERVICE_CATEGORIES;

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [isPriceEditorOpen, setIsPriceEditorOpen] = useState(false);

  if (!categories || categories.length === 0) {
    return (
      <section
        className="space-y-6"
        data-testid="section-pricelist"
        data-section="price-list"
      >
        <div
          data-testid="no-services-message"
          className="p-8 text-center text-slate-500 bg-slate-100 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-400 rounded-2xl"
        >
          {language === 'ru'
            ? 'Нет доступных услуг в прейскуранте'
            : "Narxlar ro'yxatida xizmatlar mavjud emas"}
        </div>
      </section>
    );
  }

  // Filter categories based on search query, group, and duration
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories.filter((category: ServiceCategory) => {
      // 1. Group filter
      if (groupFilter === 'phyto' && category.categoryNumber > 3) {
        return false;
      }
      if (groupFilter === 'massage' && category.categoryNumber <= 3) {
        return false;
      }

      // 2. Duration filter
      if (durationFilter !== 'all') {
        const hasMatchingDuration = category.options.some(
          (opt) => opt.durationMinutes === durationFilter
        );
        if (!hasMatchingDuration) return false;
      }

      // 3. Search query filter
      if (!query) return true;

      const titleRu = category.nameRu.toLowerCase();
      const titleUz = category.nameUz.toLowerCase();
      const descRu = (category.descriptionRu || '').toLowerCase();
      const descUz = (category.descriptionUz || '').toLowerCase();
      const numStr = category.categoryNumber.toString();

      // Check prices and durations
      const matchesPriceOrDuration = category.options.some((opt) => {
        return (
          opt.priceUZS.toString().includes(query) ||
          opt.durationMinutes.toString().includes(query) ||
          opt.priceFormatted.toLowerCase().includes(query)
        );
      });

      return (
        numStr.includes(query) ||
        titleRu.includes(query) ||
        titleUz.includes(query) ||
        descRu.includes(query) ||
        descUz.includes(query) ||
        matchesPriceOrDuration
      );
    });
  }, [categories, searchQuery, groupFilter, durationFilter]);

  const isFiltered =
    searchQuery.trim() !== '' ||
    groupFilter !== 'all' ||
    durationFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setGroupFilter('all');
    setDurationFilter('all');
  };

  return (
    <section
      className="space-y-6"
      data-testid="section-pricelist"
      data-section="price-list"
    >
      <div data-testid="price-list-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 rounded-[26px] p-5 sm:p-6 shadow-sm dark:shadow-2xl transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>{t('priceList.badge')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('priceList.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-white/60 mt-1">
              {t('priceList.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPriceEditorOpen(true)}
              data-testid="open-price-editor-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[14px] bg-amber-400 hover:bg-amber-500 text-slate-950 dark:bg-[#ffd60a] dark:hover:bg-[#ffdf33] dark:text-black text-xs font-extrabold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('priceList.editPriceList') || (language === 'ru' ? 'Редактировать прейскурант' : 'Narxlarni tahrirlash')}</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#2c2c2e] dark:text-white/80 dark:border-white/10 text-xs font-bold">
              {BUSINESS_CONTACTS.nameRu} • {language === 'ru' ? 'Справочник цен' : 'Narxlar ma\'lumotnomasi'}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Interactive Filter Bar */}
      <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 rounded-[22px] p-4 shadow-sm dark:shadow-lg backdrop-blur-sm space-y-3 transition-colors">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-white/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('priceList.searchPlaceholder')}
            data-testid="catalog-search-input"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-[14px] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:placeholder-white/40 dark:focus:border-[#30d158]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filters">
            <span className="text-slate-400 font-medium inline-flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
            </span>

            {/* Category Type Filter */}
            <button
              type="button"
              onClick={() => setGroupFilter('all')}
              data-testid="filter-all"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                groupFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              {t('priceList.filterAll')}
            </button>
            <button
              type="button"
              onClick={() => setGroupFilter('phyto')}
              data-testid="filter-phyto"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                groupFilter === 'phyto'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              {t('priceList.filterPhyto')}
            </button>
            <button
              type="button"
              onClick={() => setGroupFilter('massage')}
              data-testid="filter-massage"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                groupFilter === 'massage'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              {t('priceList.filterMassage')}
            </button>

            {/* Duration Filters */}
            <span className="text-slate-300 dark:text-slate-600 mx-1">|</span>
            <button
              type="button"
              onClick={() => setDurationFilter(durationFilter === 40 ? 'all' : 40)}
              data-testid="filter-duration-40"
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                durationFilter === 40
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              40 {t('priceList.minutesSuffix')}
            </button>
            <button
              type="button"
              onClick={() => setDurationFilter(durationFilter === 60 ? 'all' : 60)}
              data-testid="filter-duration-60"
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                durationFilter === 60
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              60 {t('priceList.minutesSuffix')}
            </button>
          </div>

          {/* Reset Filters button if active */}
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              data-testid="catalog-clear-search"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-teal-300 transition-colors ml-auto py-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('priceList.resetFilter')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Services List / Grid */}
      {filteredCategories.length === 0 ? (
        <div
          className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm dark:bg-slate-800/60 dark:border-slate-700/60"
          data-testid="catalog-empty-state"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 dark:bg-slate-700/50">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            {t('priceList.noResults')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? `"${searchQuery}"`
              : (language === 'ru' ? 'Попробуйте изменить параметры фильтрации' : "Filtr parametrlarini o'zgartirib ko'ring")}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
          >
            {t('priceList.resetFilter')}
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          data-testid="service-categories-list"
          data-grid="catalog-grid"
        >
          {filteredCategories.map((category) => {
            const isUz = language === 'uz';
            const categoryTitle = isUz ? category.nameUz : category.nameRu;
            const alternateTitle = isUz ? category.nameRu : category.nameUz;
            const description = isUz ? category.descriptionUz : category.descriptionRu;

            return (
              <div
                key={category.id}
                data-testid={`service-card-${category.categoryNumber}`}
                className="bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-white/20 rounded-[22px] p-5 shadow-sm dark:shadow-lg flex flex-col justify-between transition-all duration-200 group"
              >
                <div data-testid={`service-category-${category.categoryNumber}`}>
                  {/* Card Header with Category Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span
                      data-testid={`category-badge-${category.categoryNumber}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30"
                    >
                      {t('priceList.categoryBadge')} #{category.categoryNumber}
                    </span>

                    {category.posterItems && category.posterItems.length > 0 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {language === 'ru' ? 'Позиции:' : 'Pozitsiyalar:'} {category.posterItems.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Service Title */}
                  <h3
                    data-testid={`service-title-${category.categoryNumber}`}
                    className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug dark:text-white dark:group-hover:text-teal-200"
                  >
                    {categoryTitle}
                  </h3>

                  {/* Secondary bilingual title for context */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 italic">
                    {alternateTitle}
                  </p>

                  {/* Description */}
                  {description && (
                    <p
                      data-testid={`service-desc-${category.categoryNumber}`}
                      className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-3"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {/* Pricing and Duration Options */}
                <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-700/70 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('priceList.duration')} &amp; {t('priceList.price')}:
                  </div>

                  <div className="space-y-2">
                    {category.options.map((option) => (
                      <div
                        key={`${category.id}-${option.durationMinutes}-${option.priceUZS}`}
                        data-testid={`price-option-${category.categoryNumber}-${option.durationMinutes}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 transition-colors dark:bg-slate-900/70 dark:border-slate-700/50 dark:hover:border-slate-600"
                      >
                        {/* Duration Pill */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-emerald-700 font-semibold text-xs border border-slate-200 dark:bg-slate-800 dark:text-teal-300 dark:border-slate-700">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" />
                            <span>{formatDuration(option.durationMinutes, language)}</span>
                          </span>
                        </div>

                        {/* Price Tag with font-mono tabular-nums */}
                        <div className="text-right">
                          <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrencyUZS(option.priceUZS, language)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POS Catalog Information Footer */}
      <section
        className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm dark:bg-slate-800/70 dark:border-slate-700/80 dark:shadow-xl transition-colors"
        data-testid="catalog-footer-info"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{BUSINESS_CONTACTS.nameRu} • {BUSINESS_CONTACTS.nameUz}</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ru' ? 'Официальный прейскурант салона' : 'Salon rasmiy narxlar ro\'yxati'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ru'
                ? '8 основных категорий оздоровительных процедур и спа-массажей'
                : '8 ta asosiy sog\'lomlashtirish muolajalari va spa-massajlar toifalari'}
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
            <span className="font-mono text-emerald-600 dark:text-teal-400 font-bold">{categories.length} {language === 'ru' ? 'категорий услуг' : 'toifalar'}</span>
          </div>
        </div>
      </section>
      </div>

      {/* Admin Price List Editor Modal */}
      {hasStore && isPriceEditorOpen && (
        <PriceEditorModal onClose={() => setIsPriceEditorOpen(false)} />
      )}
    </section>
  );
};
