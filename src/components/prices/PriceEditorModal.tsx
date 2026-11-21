import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Plus,
  Trash2,
  RotateCcw,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PriceEditorModalProps {
  onClose: () => void;
}

export const PriceEditorModal: React.FC<PriceEditorModalProps> = ({ onClose }) => {
  const { language } = useTranslation();
  const {
    services,
    updateServiceCategory,
    deleteServiceCategory,
    addServiceCategory,
    addServiceOption,
    updateServiceOption,
    deleteServiceOption,
    resetServicesToDefault,
  } = useStore();

  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCatNameRu, setNewCatNameRu] = useState('');
  const [newCatNameUz, setNewCatNameUz] = useState('');
  const [newCatDuration, setNewCatDuration] = useState('40');
  const [newCatPrice, setNewCatPrice] = useState('350000');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameRu.trim()) return;

    addServiceCategory({
      categoryNumber: services.length + 1,
      nameRu: newCatNameRu.trim(),
      nameUz: newCatNameUz.trim() || newCatNameRu.trim(),
      options: [
        {
          durationMinutes: Number(newCatDuration) || 40,
          priceUZS: Number(newCatPrice) || 350000,
          priceFormatted: `${(Number(newCatPrice) || 350000).toLocaleString()} UZS`,
        },
      ],
    });

    setNewCatNameRu('');
    setNewCatNameUz('');
    setIsAddingNewCategory(false);
    showSuccess(
      language === 'ru'
        ? 'Новая категория услуги добавлена в прейскурант!'
        : 'Yangi xizmat toifasi narxlar ro\'yxatiga qo\'shildi!'
    );
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        language === 'ru'
          ? 'Вы уверены, что хотите сбросить все услуги и цены к исходным?'
          : 'Haqiqatan ham barcha xizmatlar va narxlarni asl holatiga qaytarmoqchimisiz?'
      )
    ) {
      resetServicesToDefault();
      showSuccess(
        language === 'ru' ? 'Прейскурант сброшен к исходным ценам' : 'Narxlar ro\'yxati asl holatiga qaytarildi'
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="price-editor-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#1c1c1e] text-white border border-white/10 rounded-[26px] w-full max-w-4xl p-5 sm:p-6 shadow-2xl space-y-5 my-8">
        {/* iOS Grabber Pill */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#ffd60a]/20 text-[#ffd60a] flex items-center justify-center border border-[#ffd60a]/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80 border border-white/10 mb-0.5">
                <Sparkles className="w-3 h-3 text-[#ffd60a]" />
                <span>Price List Management</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {language === 'ru' ? 'Редактор прейскуранта' : 'Narxlar ro\'yxati muharriri'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              data-testid="reset-price-list-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Сбросить к исходным' : 'Asl holatga'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              data-testid="close-price-editor-btn"
              className="w-8 h-8 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success toast */}
        {successBanner && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold">
            {successBanner}
          </div>
        )}

        {/* Action button to add new category */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {language === 'ru'
              ? `Всего категорий в прейскуранте: ${services.length}`
              : `Jami toifalar: ${services.length}`}
          </span>
          <button
            type="button"
            onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
            data-testid="add-new-service-category-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ru' ? '+ Добавить услугу' : '+ Xizmat qo\'shish'}</span>
          </button>
        </div>

        {/* Add Category Form */}
        {isAddingNewCategory && (
          <form
            onSubmit={handleCreateCategory}
            className="bg-slate-950/80 border border-teal-500/40 rounded-2xl p-4 space-y-3 animate-fadeIn"
          >
            <h4 className="text-xs font-extrabold uppercase text-teal-400">
              {language === 'ru' ? 'Новая услуга' : 'Yangi xizmat'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {language === 'ru' ? 'Название услуги (RU) *' : 'Xizmat nomi (RU) *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCatNameRu}
                  onChange={(e) => setNewCatNameRu(e.target.value)}
                  placeholder="Тайский массаж"
                  data-testid="new-category-name-ru-input"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {language === 'ru' ? 'Название услуги (UZ)' : 'Xizmat nomi (UZ)'}
                </label>
                <input
                  type="text"
                  value={newCatNameUz}
                  onChange={(e) => setNewCatNameUz(e.target.value)}
                  placeholder="Tailandcha massaj"
                  data-testid="new-category-name-uz-input"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {language === 'ru' ? 'Длительность (минут)' : 'Davomiyligi (daq)'}
                </label>
                <input
                  type="number"
                  value={newCatDuration}
                  onChange={(e) => setNewCatDuration(e.target.value)}
                  data-testid="new-category-duration-input"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {language === 'ru' ? 'Стоимость (UZS)' : 'Narxi (so\'m)'}
                </label>
                <input
                  type="number"
                  value={newCatPrice}
                  onChange={(e) => setNewCatPrice(e.target.value)}
                  data-testid="new-category-price-input"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNewCategory(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                {language === 'ru' ? 'Отмена' : 'Bekor qilish'}
              </button>
              <button
                type="submit"
                data-testid="save-new-category-btn"
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                {language === 'ru' ? 'Создать услугу' : 'Xizmat yaratish'}
              </button>
            </div>
          </form>
        )}

        {/* Existing Services List */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {services.map((category) => {
            return (
              <div
                key={category.id}
                data-testid={`editable-category-${category.id}`}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all"
              >
                {/* Category Header with Editable Names */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                      #{category.categoryNumber}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {language === 'uz' ? category.nameUz : category.nameRu}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addServiceOption(category.id, {
                          durationMinutes: 40,
                          priceUZS: 350000,
                        })
                      }
                      data-testid={`add-option-to-cat-${category.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-teal-300 border border-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{language === 'ru' ? '+ Вариант' : '+ Variant'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteServiceCategory(category.id)}
                      data-testid={`delete-category-btn-${category.id}`}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title={language === 'ru' ? 'Удалить категорию' : 'Toifani o\'chirish'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Edit Category Title Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">Название (RU):</span>
                    <input
                      type="text"
                      value={category.nameRu}
                      onChange={(e) =>
                        updateServiceCategory(category.id, { nameRu: e.target.value })
                      }
                      data-testid={`input-cat-name-ru-${category.id}`}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Nomi (UZ):</span>
                    <input
                      type="text"
                      value={category.nameUz}
                      onChange={(e) =>
                        updateServiceCategory(category.id, { nameUz: e.target.value })
                      }
                      data-testid={`input-cat-name-uz-${category.id}`}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500 mt-0.5"
                    />
                  </div>
                </div>

                {/* Options (Duration & Price) */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">
                    {language === 'ru' ? 'Варианты длительности и цены:' : 'Davomiylik va narx variantlari:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {category.options.map((opt, optIdx) => (
                      <div
                        key={`${category.id}-opt-${optIdx}`}
                        className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          <input
                            type="number"
                            value={opt.durationMinutes}
                            onChange={(e) =>
                              updateServiceOption(category.id, optIdx, {
                                durationMinutes: Number(e.target.value) || 0,
                                priceUZS: opt.priceUZS,
                              })
                            }
                            className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white font-mono"
                          />
                          <span className="text-slate-400 text-[11px]">
                            {language === 'ru' ? 'мин' : 'daq'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-slate-500 text-[11px]">:</span>
                          <input
                            type="number"
                            value={opt.priceUZS}
                            onChange={(e) =>
                              updateServiceOption(category.id, optIdx, {
                                durationMinutes: opt.durationMinutes,
                                priceUZS: Number(e.target.value) || 0,
                              })
                            }
                            data-testid={`input-price-${category.categoryNumber}-${opt.durationMinutes}`}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-emerald-400"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteServiceOption(category.id, optIdx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title={language === 'ru' ? 'Удалить вариант' : 'O\'chirish'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {language === 'ru' ? 'Готово / Закрыть' : 'Tayyor / Yopish'}
          </button>
        </div>
      </div>
    </div>
  );
};
