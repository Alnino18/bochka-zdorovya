import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { formatCurrencyUZS } from '../../utils/calculations';
import { X, Plus, Trash2, Check, Coffee, DollarSign, Edit3 } from 'lucide-react';

interface BarEditorModalProps {
  onClose: () => void;
}

export const BarEditorModal: React.FC<BarEditorModalProps> = ({ onClose }) => {
  const { language } = useTranslation();
  const {
    selectedDate,
    currentRecord,
    updateBar,
    addBarSale,
    updateBarSaleItem,
    removeBarSaleItem,
  } = useStore();

  const currentRevenue = currentRecord?.bar?.revenue ?? 0;
  const items = currentRecord?.bar?.items || [];

  const [totalRevenueInput, setTotalRevenueInput] = useState<string>(String(currentRevenue));
  const [totalSavedFeedback, setTotalSavedFeedback] = useState(false);

  // New item draft
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Editing state for an individual item
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Keep total input in sync when revenue updates externally
  useEffect(() => {
    setTotalRevenueInput(String(currentRevenue));
  }, [currentRevenue]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSaveTotal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(0, Number(totalRevenueInput) || 0);
    updateBar(selectedDate, { revenue: val });
    setTotalSavedFeedback(true);
    setTimeout(() => setTotalSavedFeedback(false), 2000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(newItemPrice);
    if (!newItemName.trim() || isNaN(price) || price <= 0) return;

    addBarSale(selectedDate, price, newItemName.trim());
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleAddPreset = (name: string, price: number) => {
    addBarSale(selectedDate, price, name);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditName(items[index].name);
    setEditPrice(String(items[index].price));
  };

  const handleSaveEdit = (index: number) => {
    const price = Number(editPrice);
    if (!editName.trim() || isNaN(price) || price <= 0) return;

    updateBarSaleItem(selectedDate, index, { name: editName.trim(), price });
    setEditingIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    removeBarSaleItem(selectedDate, index);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bar-editor-title"
      data-testid="bar-editor-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-[26px] max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto transition-colors">
        {/* iOS Grabber Pill */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[14px] bg-amber-50 text-amber-600 dark:bg-[#ffd60a]/20 dark:text-[#ffd60a] flex items-center justify-center border border-amber-200 dark:border-[#ffd60a]/30">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 id="bar-editor-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {language === 'ru' ? 'Управление баром' : 'Barni boshqarish'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-white/50">
                {language === 'ru' ? 'Редактирование выручки и позиций' : 'Tushum va mahsulotlarni tahrirlash'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-bar-editor-btn"
            aria-label={language === 'ru' ? 'Закрыть' : 'Yopish'}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-white/70 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Direct Daily Revenue Editing */}
        <div className="bg-slate-50 dark:bg-[#2c2c2e] rounded-[20px] p-4 border border-slate-200 dark:border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="bar-total-input" className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-[#ffd60a] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Общая выручка бара' : 'Umumiy bar tushumi'}</span>
            </label>
            <span className="text-xs font-mono font-bold text-amber-800 dark:text-[#ffd60a]">
              {formatCurrencyUZS(currentRevenue, language)}
            </span>
          </div>

          <form onSubmit={handleSaveTotal} className="flex items-center gap-2">
            <input
              id="bar-total-input"
              type="number"
              min="0"
              value={totalRevenueInput}
              onChange={(e) => setTotalRevenueInput(e.target.value)}
              data-testid="bar-total-revenue-input"
              placeholder={language === 'ru' ? 'Сумма бара (UZS)' : "Bar summasi (so'm)"}
              className="flex-1 bg-white border border-slate-300 rounded-[14px] px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-500 dark:bg-[#1c1c1e] dark:border-white/10 dark:text-white dark:focus:border-[#ffd60a]"
            />
            <button
              type="submit"
              data-testid="bar-editor-save-total-btn"
              className="px-4 py-2 rounded-[14px] bg-amber-400 hover:bg-amber-500 text-slate-950 dark:bg-[#ffd60a] dark:hover:bg-[#ffdf33] dark:text-black text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              {totalSavedFeedback ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
              <span>{language === 'ru' ? 'Сохранить' : 'Saqlash'}</span>
            </button>
          </form>
        </div>

        {/* 2. Quick Presets */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">
            {language === 'ru' ? 'Быстрые напитки' : 'Tezkor ichimliklar'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { ru: 'Вода', uz: 'Suv', price: 10000 },
              { ru: 'Чай', uz: 'Choy', price: 20000 },
              { ru: 'Кофе', uz: 'Kofe', price: 30000 },
              { ru: 'Напиток', uz: 'Ichimlik', price: 50000 },
            ].map((preset) => {
              const name = language === 'uz' ? preset.uz : preset.ru;
              return (
                <button
                  key={preset.price}
                  type="button"
                  onClick={() => handleAddPreset(name, preset.price)}
                  data-testid={`bar-preset-add-${preset.price}`}
                  className="px-2.5 py-2 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-amber-800 border border-slate-200 text-xs font-bold transition-all active:scale-95 text-center cursor-pointer dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-[#ffd60a] dark:border-white/5"
                >
                  + {name} {preset.price / 1000}k
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Add Custom Bar Item Form */}
        <form onSubmit={handleAddItem} className="bg-slate-50 dark:bg-[#2c2c2e] rounded-[20px] p-3.5 border border-slate-200 dark:border-white/5 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 dark:text-white/80 block">
            {language === 'ru' ? '+ Добавить новую позицию' : "+ Yangi mahsulot qo'shish"}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              data-testid="new-bar-item-name"
              placeholder={language === 'ru' ? 'Название (напр. Чай с лимоном)' : 'Nomi (masalan, Choy)'}
              className="bg-white border border-slate-300 rounded-[12px] px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 dark:bg-[#1c1c1e] dark:border-white/10 dark:text-white dark:focus:border-[#ffd60a]"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                data-testid="new-bar-item-price"
                placeholder={language === 'ru' ? 'Цена (UZS)' : "Narxi (so'm)"}
                className="flex-1 bg-white border border-slate-300 rounded-[12px] px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 dark:bg-[#1c1c1e] dark:border-white/10 dark:text-white dark:focus:border-[#ffd60a]"
              />
              <button
                type="submit"
                data-testid="add-bar-custom-item-btn"
                className="px-3.5 py-1.5 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#30d158] dark:hover:bg-[#28b84d] dark:text-black text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{language === 'ru' ? 'Добавить' : "Qo'shish"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* 4. List of Individual Daily Bar Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/60">
              {language === 'ru' ? 'Позиции за сегодня' : 'Bugungi mahsulotlar'} ({items.length})
            </span>
          </div>

          {items.length === 0 ? (
            <div
              data-testid="bar-items-empty"
              className="p-5 text-center text-xs text-slate-400 dark:text-white/40 bg-slate-100 dark:bg-[#2c2c2e]/50 border border-slate-200 dark:border-white/5 rounded-[18px]"
            >
              {language === 'ru' ? 'Позиции бара еще не добавлены' : 'Bar mahsulotlari hali kiritilmagan'}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1" data-testid="bar-items-list">
              {items.map((item, idx) => {
                const isEditing = editingIndex === idx;
                return (
                  <div
                    key={idx}
                    data-testid={`bar-item-row-${idx}`}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-[16px] bg-slate-50 dark:bg-[#2c2c2e] border border-slate-200 dark:border-white/5 text-xs text-slate-900 dark:text-white"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          data-testid={`edit-bar-item-name-${idx}`}
                          className="flex-1 bg-white border border-slate-300 dark:bg-[#1c1c1e] dark:border-white/10 rounded-[10px] px-2.5 py-1 text-xs text-slate-900 dark:text-white"
                        />
                        <input
                          type="number"
                          min="0"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          data-testid={`edit-bar-item-price-${idx}`}
                          className="w-24 bg-white border border-slate-300 dark:bg-[#1c1c1e] dark:border-white/10 rounded-[10px] px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idx)}
                          data-testid={`save-bar-item-${idx}`}
                          className="p-1.5 rounded-[10px] bg-emerald-600 text-white dark:bg-[#30d158] dark:text-black font-bold cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="p-1.5 rounded-[10px] bg-slate-200 text-slate-700 dark:bg-[#3a3a3c] dark:text-white/70 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white/60 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white truncate" data-testid={`bar-item-name-${idx}`}>
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-mono font-bold text-amber-700 dark:text-[#ffd60a]" data-testid={`bar-item-price-${idx}`}>
                            {formatCurrencyUZS(item.price, language)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            data-testid={`edit-bar-item-${idx}`}
                            title={language === 'ru' ? 'Редактировать' : 'Tahrirlash'}
                            className="p-1 rounded-[8px] bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/70 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            data-testid={`delete-bar-item-${idx}`}
                            title={language === 'ru' ? 'Удалить' : "O'chirish"}
                            className="p-1 rounded-[8px] bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-[#ff453a]/20 dark:hover:bg-[#ff453a]/30 dark:text-[#ff453a] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            data-testid="bar-editor-done-btn"
            className="w-full sm:w-auto px-6 py-2.5 rounded-[16px] bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#30d158] dark:hover:bg-[#28b84d] dark:text-black text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {language === 'ru' ? 'Готово' : 'Tayyor'}
          </button>
        </div>
      </div>
    </div>
  );
};
