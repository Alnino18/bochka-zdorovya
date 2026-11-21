import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { X, UserPlus } from 'lucide-react';

interface AddMasterModalProps {
  onClose: () => void;
}

export const AddMasterModal: React.FC<AddMasterModalProps> = ({ onClose }) => {
  const { t, language } = useTranslation();
  const { selectedDate, addMaster } = useStore();
  const [name, setName] = useState('');
  const [nameUz, setNameUz] = useState('');
  const [initialSession, setInitialSession] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMaster(selectedDate, {
      name: name.trim(),
      nameUz: nameUz.trim() || undefined,
      initialSession: initialSession ? Number(initialSession) : undefined,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-master-title"
      data-testid="add-master-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 id="add-master-title" className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-400" />
            <span>{t('journal.addMaster')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="cancel-master-btn"
            aria-label={t('journal.actions.cancel')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="master-name-ru" className="block text-xs font-medium text-slate-300 mb-1">
              {t('journal.masterNamePlaceholder')} (RU) *
            </label>
            <input
              id="master-name-ru"
              type="text"
              required
              data-testid="master-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иро"
              className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="master-name-uz" className="block text-xs font-medium text-slate-300 mb-1">
              Usta ismi (UZ)
            </label>
            <input
              id="master-name-uz"
              type="text"
              data-testid="master-name-uz-input"
              value={nameUz}
              onChange={(e) => setNameUz(e.target.value)}
              placeholder="Iro"
              className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="master-initial-session" className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'ru' ? 'Начальный сеанс (необязательно, UZS)' : "Boshlang'ich seans (ixtiyoriy, UZS)"}
            </label>
            <input
              id="master-initial-session"
              type="number"
              data-testid="master-initial-session-input"
              value={initialSession}
              onChange={(e) => setInitialSession(e.target.value)}
              placeholder="320000"
              className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors"
            >
              {t('journal.actions.cancel')}
            </button>
            <button
              type="submit"
              data-testid="submit-master-btn"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white shadow-md transition-colors"
            >
              {t('journal.addMaster')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
