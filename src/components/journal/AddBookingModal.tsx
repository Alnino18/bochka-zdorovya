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
      <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <h3 id="add-booking-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-emerald-600 dark:text-teal-400" />
            <span>{t('journal.addBooking')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="cancel-booking-btn"
            aria-label={t('journal.actions.cancel')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-700 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="booking-time" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('journal.time')} *
              </label>
              <input
                id="booking-time"
                type="time"
                required
                data-testid="booking-time-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="booking-party" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="booking-phone" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="booking-client" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('journal.clientName')}
            </label>
            <input
              id="booking-client"
              type="text"
              data-testid="booking-name-input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={language === 'ru' ? 'Имя клиента' : 'Mijoz ismi'}
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="booking-notes" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('journal.notes')}
            </label>
            <input
              id="booking-notes"
              type="text"
              data-testid="booking-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'ru' ? 'Пожелания, особенности' : 'Izohlar'}
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 dark:text-slate-400 dark:hover:text-white dark:border-slate-700 cursor-pointer"
            >
              {t('journal.actions.cancel')}
            </button>
            <button
              type="submit"
              data-testid="submit-booking-btn"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              {t('journal.addBooking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
