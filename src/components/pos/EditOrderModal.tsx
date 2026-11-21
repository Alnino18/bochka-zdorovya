import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { MasterEntry, ServiceOrderItem, OrderBarItem } from '../../types/accounting';
import { formatCurrencyUZS, formatDuration } from '../../constants/catalogData';
import {
  X,
  Check,
  User,
  Clock,
  DollarSign,
  Coffee,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface EditOrderModalProps {
  order: ServiceOrderItem;
  currentMaster: MasterEntry;
  onClose: () => void;
  onSaved?: (msg: string) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  currentMaster,
  onClose,
  onSaved,
}) => {
  const { language } = useTranslation();
  const { selectedDate, currentRecord, updateOrder, services } = useStore();

  const masters = currentRecord?.masters || [];

  const [selectedMasterId, setSelectedMasterId] = useState<string>(currentMaster.id);
  const [serviceNameRu, setServiceNameRu] = useState<string>(order.serviceName || '');
  const [serviceNameUz, setServiceNameUz] = useState<string>(order.serviceNameUz || order.serviceName || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(order.durationMinutes || 40);
  const [priceInput, setPriceInput] = useState<string>(String(order.price || 300000));
  const [barItems, setBarItems] = useState<OrderBarItem[]>(order.barItems || []);
  const [customBarName, setCustomBarName] = useState<string>('');
  const [customBarPrice, setCustomBarPrice] = useState<string>('20000');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Preset Bar Item addition
  const handleAddBarPreset = (nameRu: string, nameUz: string, price: number) => {
    const newItem: OrderBarItem = {
      id: `bi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: nameRu,
      nameUz,
      price,
    };
    setBarItems((prev) => [...prev, newItem]);
  };

  const handleAddCustomBar = () => {
    const price = Number(customBarPrice) || 0;
    const name = customBarName.trim() || (language === 'ru' ? 'Напиток' : 'Ichimlik');
    if (price > 0) {
      const newItem: OrderBarItem = {
        id: `bi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        nameUz: name,
        price,
      };
      setBarItems((prev) => [...prev, newItem]);
      setCustomBarName('');
    }
  };

  const handleRemoveBarItem = (id: string) => {
    setBarItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSelectServiceFromCatalog = (catNameRu: string, catNameUz: string, dur: number, price: number) => {
    setServiceNameRu(catNameRu);
    setServiceNameUz(catNameUz);
    setDurationMinutes(dur);
    setPriceInput(String(price));
  };

  const barTotal = barItems.reduce((acc, it) => acc + (it.price || 0), 0);
  const massagePrice = Number(priceInput) || 0;
  const orderTotal = massagePrice + barTotal;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrice = Number(priceInput) || order.price;

    updateOrder(selectedDate, currentMaster.id, order.id, {
      newMasterId: selectedMasterId,
      serviceName: serviceNameRu.trim() || order.serviceName,
      serviceNameUz: serviceNameUz.trim() || serviceNameRu.trim() || order.serviceName,
      durationMinutes,
      price: finalPrice,
      barItems,
    });

    const targetMaster = masters.find((m) => m.id === selectedMasterId) || currentMaster;
    const masterDisplayName = language === 'uz' && targetMaster.nameUz ? targetMaster.nameUz : targetMaster.name;
    const msg =
      language === 'ru'
        ? `Заказ обновлен: ${masterDisplayName} — ${serviceNameRu} (${formatCurrencyUZS(finalPrice, 'ru')})`
        : `Buyurtma yangilandi: ${masterDisplayName} — ${serviceNameUz} (${formatCurrencyUZS(finalPrice, 'uz')})`;

    if (onSaved) onSaved(msg);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="edit-order-modal"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {language === 'ru' ? 'Редактирование заказа' : 'Buyurtmani tahrirlash'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ru' ? 'Изменение услуги, массажистки, цены и бара' : 'Xizmat, massajistka, narx va barni o\'zgartirish'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="cancel-order-edit-btn"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* 1. Change Massajistka */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Массажистка' : 'Massajistka'}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {masters.map((m) => {
                const isSelected = selectedMasterId === m.id;
                const mName = language === 'uz' && m.nameUz ? m.nameUz : m.name;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMasterId(m.id)}
                    data-testid={`edit-order-master-btn-${m.id}`}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-1 ring-emerald-400'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <span>{mName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Choose from Price List or Custom Service */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Выбрать услугу из прейскуранта' : 'Narxlar ro\'yxatidan xizmat tanlash'}</span>
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-800 rounded-xl p-2 bg-slate-950/50">
              {services.map((cat) => {
                const cName = language === 'uz' ? cat.nameUz : cat.nameRu;
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-300 px-1 pt-1 truncate">
                      #{cat.categoryNumber} {cName}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {cat.options.map((opt) => (
                        <button
                          key={`${cat.id}-${opt.durationMinutes}-${opt.priceUZS}`}
                          type="button"
                          onClick={() =>
                            handleSelectServiceFromCatalog(
                              cat.nameRu,
                              cat.nameUz,
                              opt.durationMinutes,
                              opt.priceUZS
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-1.5"
                        >
                          <span>{formatDuration(opt.durationMinutes, language)}</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {formatCurrencyUZS(opt.priceUZS, language)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Name & Duration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {language === 'ru' ? 'Название услуги' : 'Xizmat nomi'}
              </label>
              <input
                type="text"
                value={language === 'uz' ? serviceNameUz : serviceNameRu}
                onChange={(e) => {
                  if (language === 'uz') {
                    setServiceNameUz(e.target.value);
                  } else {
                    setServiceNameRu(e.target.value);
                  }
                }}
                data-testid="edit-order-service-input"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {language === 'ru' ? 'Длительность' : 'Davomiyligi'}
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
                data-testid="edit-order-duration-select"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={40}>40 {language === 'ru' ? 'мин' : 'daq'}</option>
                <option value={60}>60 {language === 'ru' ? 'мин' : 'daq'}</option>
                <option value={0}>{language === 'ru' ? 'Произвольно' : 'Boshqa'}</option>
              </select>
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Стоимость массажа (UZS)' : 'Massaj narxi (so\'m)'}</span>
            </label>
            <input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              data-testid="edit-order-price-input"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 3. Bar Items Section (Tea, Water, Coffee) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5" />
                <span>{language === 'ru' ? 'Добавить чай / напитки к заказу' : 'Buyurtmaga choy / ichimlik qo\'shish'}</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-300">
                +{formatCurrencyUZS(barTotal, language)}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { nameRu: 'Чай', nameUz: 'Choy', price: 20000 },
                { nameRu: 'Вода', nameUz: 'Suv', price: 10000 },
                { nameRu: 'Кофе', nameUz: 'Kofe', price: 30000 },
                { nameRu: 'Напиток', nameUz: 'Ichimlik', price: 50000 },
              ].map((p) => (
                <button
                  key={p.price + p.nameRu}
                  type="button"
                  onClick={() => handleAddBarPreset(p.nameRu, p.nameUz, p.price)}
                  data-testid={`edit-order-add-bar-${p.price}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-amber-300 hover:text-white transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'uz' ? p.nameUz : p.nameRu} ({p.price / 1000}k)</span>
                </button>
              ))}
            </div>

            {/* Custom Bar Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder={language === 'ru' ? 'Другой напиток / снек' : 'Boshqa ichimlik'}
                value={customBarName}
                onChange={(e) => setCustomBarName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder="Сумма"
                value={customBarPrice}
                onChange={(e) => setCustomBarPrice(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomBar}
                className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                +
              </button>
            </div>

            {/* List of Attached Bar Items */}
            {barItems.length > 0 && (
              <div className="space-y-1 pt-1.5 border-t border-slate-800">
                {barItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between text-xs bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    <span className="text-slate-300">
                      {language === 'uz' && it.nameUz ? it.nameUz : it.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300">
                        {formatCurrencyUZS(it.price, language)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBarItem(it.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grand Total Bar */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">
                {language === 'ru' ? 'Итоговая стоимость заказа' : 'Buyurtmaning umumiy narxi'}:
              </span>
              <span className="text-[11px] text-slate-500">
                {formatCurrencyUZS(massagePrice, language)} (массаж) + {formatCurrencyUZS(barTotal, language)} (бар)
              </span>
            </div>
            <div className="font-mono text-xl font-extrabold text-emerald-400" data-testid="edit-order-total-sum">
              {formatCurrencyUZS(orderTotal, language)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              {language === 'ru' ? 'Отмена' : 'Bekor qilish'}
            </button>
            <button
              type="submit"
              data-testid="save-order-edit-btn"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{language === 'ru' ? 'Сохранить изменения' : 'O\'zgarishlarni saqlash'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
