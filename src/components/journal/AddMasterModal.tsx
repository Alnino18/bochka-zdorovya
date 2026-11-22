import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { X, UserPlus, Users, Trash2 } from 'lucide-react';

interface AddMasterModalProps {
  onClose: () => void;
}

export const AddMasterModal: React.FC<AddMasterModalProps> = ({ onClose }) => {
  const { t, language } = useTranslation();
  const { selectedDate, addMaster, deleteMaster, staff, removeStaffMember } = useStore();
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

  const handleDeleteStaff = (s: { id: string; name: string; nameUz?: string }) => {
    const displayName = language === 'uz' && s.nameUz ? s.nameUz : s.name;
    const confirmMsg = language === 'ru'
      ? `Удалить массажистку "${displayName}" из постоянного состава и смены?`
      : `"${displayName}" massajistkani doimiy ro'yxat va smenadan butunlay o'chirishni tasdiqlaysizmi?`;

    if (window.confirm(confirmMsg)) {
      removeStaffMember(s.id);
      removeStaffMember(s.name);
      deleteMaster(selectedDate, s.id);
      deleteMaster(selectedDate, `m-${s.id}-${selectedDate}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-master-title"
      data-testid="add-master-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-[26px] w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto transition-colors">
        {/* iOS Grabber Pill */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <h3 id="add-master-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-[#30d158]" />
            <span>{t('journal.addMaster')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="cancel-master-btn"
            aria-label={t('journal.actions.cancel')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-white/70 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="master-name-ru" className="block text-xs font-bold text-slate-700 dark:text-white/80 mb-1">
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
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:focus:border-[#30d158]"
            />
          </div>

          <div>
            <label htmlFor="master-name-uz" className="block text-xs font-bold text-slate-700 dark:text-white/80 mb-1">
              Massajistka ismi (UZ)
            </label>
            <input
              id="master-name-uz"
              type="text"
              data-testid="master-name-uz-input"
              value={nameUz}
              onChange={(e) => setNameUz(e.target.value)}
              placeholder="Iro"
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:focus:border-[#30d158]"
            />
          </div>

          <div>
            <label htmlFor="master-initial-session" className="block text-xs font-bold text-slate-700 dark:text-white/80 mb-1">
              {language === 'ru' ? 'Начальный сеанс (необязательно, UZS)' : "Boshlang'ich seans (ixtiyoriy, UZS)"}
            </label>
            <input
              id="master-initial-session"
              type="number"
              data-testid="master-initial-session-input"
              value={initialSession}
              onChange={(e) => setInitialSession(e.target.value)}
              placeholder="320000"
              className="w-full bg-slate-50 border border-slate-300 text-sm font-mono text-slate-900 rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:focus:border-[#30d158]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] text-xs font-semibold dark:text-white/80 transition-colors cursor-pointer"
            >
              {t('journal.actions.cancel')}
            </button>
            <button
              type="submit"
              data-testid="submit-master-btn"
              className="px-5 py-2 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#30d158] dark:hover:bg-[#28b84d] dark:text-black text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              {t('journal.addMaster')}
            </button>
          </div>
        </form>

        {/* Existing Staff Roster Management */}
        {staff && staff.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/60">
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Текущий состав массажисток' : 'Mavjud massajistkalar'}</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {staff.map((s) => {
                const sName = language === 'uz' && s.nameUz ? s.nameUz : s.name;
                return (
                  <div
                    key={s.id}
                    data-testid={`staff-row-${s.id}`}
                    className="flex items-center justify-between p-2 rounded-[14px] bg-slate-50 border border-slate-200 dark:bg-[#2c2c2e] dark:border-white/5 text-xs text-slate-900 dark:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-[#30d158]/20 dark:text-[#30d158] flex items-center justify-center font-bold text-[11px]">
                        {sName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{sName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(s)}
                      data-testid={`sheet-delete-staff-${s.id}`}
                      aria-label={language === 'ru' ? `Удалить ${sName}` : `${sName}ni o'chirish`}
                      title={language === 'ru' ? `Удалить ${sName}` : `${sName}ni o'chirish`}
                      className="p-1 rounded-[8px] bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-[#ff453a]/20 dark:hover:bg-[#ff453a]/30 dark:text-[#ff453a] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
