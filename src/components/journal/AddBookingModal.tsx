import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { X, BookmarkPlus } from 'lucide-react';

interface AddBookingModalProps {
  onClose: () => void;
}

export const AddBookingModal: React.FC<AddBookingModalProps> = ({ onClose }) => {
  const { t, language } = useTranslation();
  const { selectedDate, addBooking } = useStore();
  const [time, setTime] = useState('19:00');
  const [phone, setPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [notes, setNotes] = useState('');

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
    if (!time.trim() || !phone.trim()) return;
    addBooking(selectedDate, {
      time: time.trim(),
      phone: phone.trim(),
      clientName: clientName.trim() || undefined,
      partySize: Number(partySize) || 1,
      notes: notes.trim() || undefined,
      completed: false,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-booking-title"
      data-testid="add-booking-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-[26px] w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 transition-colors">
        {/* iOS Grabber Pill */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <h3 id="add-booking-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-emerald-600 dark:text-[#30d158]" />
            <span>{t('journal.addBooking')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="cancel-booking-btn"
            aria-label={t('journal.actions.cancel')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-white/70 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="booking-time" className="block text-xs font-bold text-slate-700 dark:text-white/80 mb-1">
                {t('journal.time')} *
              </label>
              <input
                id="booking-time"
                type="time"
                required
                data-testid="booking-time-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:focus:border-[#30d158]"
              />
            </div>

            <div>
              <label htmlFor="booking-party" className="block text-xs font-bold text-slate-700 dark:text-white/80 mb-1">
                {t('journal.partySize')}
              </label>
              <input
                id="booking-party"
                type="number"
                min="1"
                max="20"
                data-testid="booking-party-input"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:focus:border-[#30d158]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="booking-phone" className="block text-xs font-bold text-slate-700 dark:text-white/80 mb-1">
              {t('journal.phone')} *
            </label>
            <input
              id="booking-phone"
              type="tel"
              required
              data-testid="booking-phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:focus:border-[#30d158]"
            />
          </div>

          <div>
            <label htmlFor="booking-client" className="block text-xs font-bold text-slate-700 dark:text-white/80 mb-1">
              {t('journal.clientName')}
            </label>
            <input
              id="booking-client"
              type="text"
              data-testid="booking-name-input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={language === 'ru' ? 'Имя клиента' : 'Mijoz ismi'}
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:focus:border-[#30d158]"
            />
          </div>

          <div>
            <label htmlFor="booking-notes" className="block text-xs font-bold text-slate-700 dark:text-white/80 mb-1">
              {t('journal.notes')}
            </label>
            <input
              id="booking-notes"
              type="text"
              data-testid="booking-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'ru' ? 'Пожелания, особенности' : 'Izohlar'}
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-[14px] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white dark:focus:border-[#30d158]"
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
              data-testid="submit-booking-btn"
              className="px-5 py-2 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#30d158] dark:hover:bg-[#28b84d] dark:text-black text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              {t('journal.addBooking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
