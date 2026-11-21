import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { sanitizePhoneToTelUri } from '../../utils/calculations';
import { Bookmark, Plus, Phone, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface BookingsSectionProps {
  onAddBookingClick: () => void;
}

export const BookingsSection: React.FC<BookingsSectionProps> = ({ onAddBookingClick }) => {
  const { t } = useTranslation();
  const { selectedDate, currentRecord, toggleBookingComplete, deleteBooking } = useStore();

  const bookings = currentRecord?.bookings || [];

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4" data-testid="bookings-section">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-teal-400" />
          <h4 className="text-sm font-bold text-white">{t('journal.bookingsSection')}</h4>
        </div>
        <button
          type="button"
          onClick={onAddBookingClick}
          data-testid="add-booking-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('journal.addBooking')}</span>
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs">
          Нет записей на этот день
        </div>
      ) : (
        <div className="space-y-2.5" data-testid="bookings-list">
          {bookings.map((booking) => {
            const telUri = sanitizePhoneToTelUri(booking.phone) || `tel:${booking.phone.replace(/\D/g, '')}`;
            return (
              <div
                key={booking.id}
                data-testid={`booking-card-${booking.id}`}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  booking.completed
                    ? 'bg-slate-900/40 border-slate-800 opacity-75'
                    : 'bg-slate-900/80 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleBookingComplete(selectedDate, booking.id)}
                    data-testid={`booking-toggle-${booking.id}`}
                    aria-label="Toggle completion"
                    className="text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    {booking.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold text-teal-300"
                        data-testid={`booking-time-${booking.id}`}
                      >
                        {booking.time}
                      </span>
                      {booking.clientName && (
                        <span className="text-xs font-semibold text-white">
                          • {booking.clientName}
                        </span>
                      )}
                      {booking.partySize > 1 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {booking.partySize} чел.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={telUri}
                        data-testid={`booking-call-link-${booking.id}`}
                        className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span data-testid={`booking-phone-${booking.id}`}>{booking.phone}</span>
                      </a>
                      {booking.notes && (
                        <span className="text-[11px] text-slate-500 italic">
                          ({booking.notes})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteBooking(selectedDate, booking.id)}
                  data-testid={`booking-delete-${booking.id}`}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
