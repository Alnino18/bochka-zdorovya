import React, { useState, useMemo } from 'react';
import {
  Phone,
  Instagram,
  Search,
  X,
  Clock,
  Tag,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import {
  BUSINESS_CONTACTS,
  SERVICE_CATEGORIES,
  formatDuration,
  formatCurrencyUZS,
} from '../../constants/catalogData';
import { ServiceCategory } from '../../types/catalog';

type DurationFilter = 'all' | 40 | 60;
type GroupFilter = 'all' | 'phyto' | 'massage';

interface PriceListViewProps {
  categories?: ServiceCategory[];
}

export const PriceListView: React.FC<PriceListViewProps> = ({
  categories = SERVICE_CATEGORIES,
}) => {
  const { language, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');

  if (!categories || categories.length === 0) {
    return (
      <section
        className="space-y-6"
        data-testid="section-pricelist"
        data-section="price-list"
      >
        <div
          data-testid="no-services-message"
          className="p-8 text-center text-slate-400 bg-slate-800/80 border border-slate-700 rounded-2xl"
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
      const matchesOption = category.options.some((opt) => {
        const priceStr = opt.priceUZS.toString();
        const durationRu = `${opt.durationMinutes} мин`;
        const durationUz = `${opt.durationMinutes} daq`;
        return (
          priceStr.includes(query) ||
          durationRu.toLowerCase().includes(query) ||
          durationUz.toLowerCase().includes(query)
        );
      });

      return (
        titleRu.includes(query) ||
        titleUz.includes(query) ||
        descRu.includes(query) ||
        descUz.includes(query) ||
        numStr === query ||
        matchesOption
      );
    });
  }, [categories, searchQuery, groupFilter, durationFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setGroupFilter('all');
    setDurationFilter('all');
  };

  const isFiltered = searchQuery !== '' || groupFilter !== 'all' || durationFilter !== 'all';

  return (
    <section
      className="space-y-6 animate-fadeIn"
      data-testid="section-pricelist"
      data-section="price-list"
    >
      <div data-testid="price-list-container" className="space-y-6">
      {/* View Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-950 via-slate-800 to-slate-900 border border-teal-800/50 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>{t('priceList.servicesCount')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {t('priceList.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t('priceList.subtitle')}
            </p>
          </div>

          {/* Quick Contact Action Targets */}
          <div
            className="flex flex-wrap sm:flex-nowrap items-center gap-2.5"
            data-testid="catalog-contact-actions"
          >
            <a
              href={BUSINESS_CONTACTS.phoneTel}
              data-testid="catalog-phone-link"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all group"
            >
              <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>{t('priceList.callAction')}: {BUSINESS_CONTACTS.phone}</span>
            </a>

            <a
              href={BUSINESS_CONTACTS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="catalog-instagram-link"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all group"
            >
              <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{BUSINESS_CONTACTS.instagram}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Search and Interactive Filter Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('priceList.searchPlaceholder')}
            data-testid="catalog-search-input"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
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
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                groupFilter === 'all'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t('priceList.filterAll')}
            </button>
            <button
              type="button"
              onClick={() => setGroupFilter('phyto')}
              data-testid="filter-phyto"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                groupFilter === 'phyto'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t('priceList.filterPhyto')}
            </button>
            <button
              type="button"
              onClick={() => setGroupFilter('massage')}
              data-testid="filter-massage"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                groupFilter === 'massage'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t('priceList.filterMassage')}
            </button>

            {/* Duration Filters */}
            <span className="text-slate-600 mx-1">|</span>
            <button
              type="button"
              onClick={() => setDurationFilter(durationFilter === 40 ? 'all' : 40)}
              data-testid="filter-duration-40"
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                durationFilter === 40
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              40 {t('priceList.minutesSuffix')}
            </button>
            <button
              type="button"
              onClick={() => setDurationFilter(durationFilter === 60 ? 'all' : 60)}
              data-testid="filter-duration-60"
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                durationFilter === 60
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
              className="inline-flex items-center gap-1 text-slate-400 hover:text-teal-300 transition-colors ml-auto py-1"
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
          className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8 text-center"
          data-testid="catalog-empty-state"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-700/50 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            {t('priceList.noResults')}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? `"${searchQuery}"`
              : (language === 'ru' ? 'Попробуйте изменить параметры фильтрации' : "Filtr parametrlarini o'zgartirib ko'ring")}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
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
                className="bg-slate-800/90 border border-slate-700/80 hover:border-teal-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 group hover:shadow-teal-950/20 hover:shadow-xl"
              >
                <div data-testid={`service-category-${category.categoryNumber}`}>
                  {/* Card Header with Category Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span
                      data-testid={`category-badge-${category.categoryNumber}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    >
                      {t('priceList.categoryBadge')} #{category.categoryNumber}
                    </span>

                    {category.posterItems && category.posterItems.length > 0 && (
                      <span className="text-[10px] text-slate-500">
                        {language === 'ru' ? 'Позиции:' : 'Pozitsiyalar:'} {category.posterItems.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Service Title */}
                  <h3
                    data-testid={`service-title-${category.categoryNumber}`}
                    className="text-base sm:text-lg font-bold text-white group-hover:text-teal-200 transition-colors leading-snug"
                  >
                    {categoryTitle}
                  </h3>

                  {/* Secondary bilingual title for context */}
                  <p className="text-[11px] text-slate-400 mt-0.5 italic">
                    {alternateTitle}
                  </p>

                  {/* Description */}
                  {description && (
                    <p
                      data-testid={`service-desc-${category.categoryNumber}`}
                      className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-3"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {/* Pricing and Duration Options */}
                <div className="mt-4 pt-3.5 border-t border-slate-700/70 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {t('priceList.duration')} &amp; {t('priceList.price')}:
                  </div>

                  <div className="space-y-2">
                    {category.options.map((option) => (
                      <div
                        key={`${category.id}-${option.durationMinutes}-${option.priceUZS}`}
                        data-testid={`price-option-${category.categoryNumber}-${option.durationMinutes}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-slate-600 transition-colors"
                      >
                        {/* Duration Pill */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-teal-300 font-semibold text-xs border border-slate-700">
                            <Clock className="w-3.5 h-3.5 text-teal-400" />
                            <span>{formatDuration(option.durationMinutes, language)}</span>
                          </span>
                        </div>

                        {/* Price Tag with font-mono tabular-nums */}
                        <div className="text-right">
                          <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-emerald-400">
                            {formatCurrencyUZS(option.priceUZS, language)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Book Call Target */}
                  <div className="pt-2">
                    <a
                      href={BUSINESS_CONTACTS.phoneTel}
                      aria-label={`${t('priceList.orderBooking')} (${categoryTitle})`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-700/50 hover:bg-teal-600 text-slate-300 hover:text-white text-xs font-semibold transition-all group/btn"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-400 group-hover/btn:text-white transition-colors" />
                      <span>{t('priceList.orderBooking')}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prominent Business Contacts Card Footer */}
      <section
        className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl"
        data-testid="catalog-footer-contacts"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>{BUSINESS_CONTACTS.nameRu} • {BUSINESS_CONTACTS.nameUz}</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              {t('priceList.contactsHeader')}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ru'
                ? 'г. Ташкент • Ежедневно с 09:00 до 23:00 • Запись по телефону или в Instagram'
                : 'Toshkent sh. • Har kuni 09:00 dan 23:00 gacha • Telefon yoki Instagram orqali yozilish'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={BUSINESS_CONTACTS.phoneTel}
              data-testid="footer-phone-link"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{BUSINESS_CONTACTS.phoneFormatted}</span>
            </a>

            <a
              href={BUSINESS_CONTACTS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-instagram-link"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              <Instagram className="w-4 h-4" />
              <span>{BUSINESS_CONTACTS.instagram}</span>
            </a>
          </div>
        </div>
      </section>
      </div>
    </section>
  );
};
