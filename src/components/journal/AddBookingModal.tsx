import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { X, BookmarkPlus } from 'lucide-react';

interface AddBookingModalProps {
  onClose: () => void;
}

export const AddBookingModal: React.FC<AddBookingModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { selectedDate, addBooking } = useStore();
  const [time, setTime] = useState('19:00');
  const [phone, setPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [notes, setNotes] = useState('');

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
      data-testid="add-booking-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-teal-400" />
            <span>{t('journal.addBooking')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="cancel-booking-btn"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('journal.time')} *
              </label>
              <input
                type="time"
                required
                data-testid="booking-time-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('journal.partySize')}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                data-testid="booking-party-input"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('journal.phone')} *
            </label>
            <input
              type="text"
              required
              data-testid="booking-phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="97 794 14 86"
              className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('journal.clientName')}
            </label>
            <input
              type="text"
              data-testid="booking-name-input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Жасмин"
              className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Примечание
            </label>
            <input
              type="text"
              data-testid="booking-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="2 к, массаж 60 мин"
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
              data-testid="submit-booking-btn"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white shadow-md transition-colors"
            >
              {t('journal.addBooking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
