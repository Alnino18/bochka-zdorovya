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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#1c1c1e] text-white border border-white/10 rounded-[26px] w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* iOS Grabber Pill */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 id="add-master-title" className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#30d158]" />
            <span>{t('journal.addMaster')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="cancel-master-btn"
            aria-label={t('journal.actions.cancel')}
            className="w-8 h-8 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="master-name-ru" className="block text-xs font-bold text-white/80 mb-1">
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
              className="w-full bg-[#2c2c2e] border border-white/10 text-sm text-white rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-[#30d158]"
            />
          </div>

          <div>
            <label htmlFor="master-name-uz" className="block text-xs font-bold text-white/80 mb-1">
              Massajistka ismi (UZ)
            </label>
            <input
              id="master-name-uz"
              type="text"
              data-testid="master-name-uz-input"
              value={nameUz}
              onChange={(e) => setNameUz(e.target.value)}
              placeholder="Iro"
              className="w-full bg-[#2c2c2e] border border-white/10 text-sm text-white rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-[#30d158]"
            />
          </div>

          <div>
            <label htmlFor="master-initial-session" className="block text-xs font-bold text-white/80 mb-1">
              {language === 'ru' ? 'Начальный сеанс (необязательно, UZS)' : "Boshlang'ich seans (ixtiyoriy, UZS)"}
            </label>
            <input
              id="master-initial-session"
              type="number"
              data-testid="master-initial-session-input"
              value={initialSession}
              onChange={(e) => setInitialSession(e.target.value)}
              placeholder="320000"
              className="w-full bg-[#2c2c2e] border border-white/10 text-sm font-mono text-white rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-[#30d158]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[14px] bg-[#2c2c2e] hover:bg-[#3a3a3c] text-xs font-semibold text-white/80 transition-colors"
            >
              {t('journal.actions.cancel')}
            </button>
            <button
              type="submit"
              data-testid="submit-master-btn"
              className="px-5 py-2 rounded-[14px] bg-[#30d158] hover:bg-[#28b84d] text-xs font-bold text-black shadow-md transition-all cursor-pointer active:scale-95"
            >
              {t('journal.addMaster')}
            </button>
          </div>
        </form>

        {/* Existing Staff Roster Management */}
        {staff && staff.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60">
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
                    className="flex items-center justify-between p-2 rounded-[14px] bg-[#2c2c2e] border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#30d158]/20 text-[#30d158] flex items-center justify-center font-bold text-[11px]">
                        {sName.charAt(0)}
                      </div>
                      <span className="font-semibold text-white">{sName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(s)}
                      data-testid={`sheet-delete-staff-${s.id}`}
                      aria-label={language === 'ru' ? `Удалить ${sName}` : `${sName}ni o'chirish`}
                      title={language === 'ru' ? `Удалить ${sName}` : `${sName}ni o'chirish`}
                      className="p-1 rounded-[8px] bg-[#ff453a]/20 hover:bg-[#ff453a]/30 text-[#ff453a] transition-colors cursor-pointer"
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
