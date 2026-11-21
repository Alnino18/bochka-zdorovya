import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { MasterEntry } from '../../types/accounting';
import { formatCurrencyUZS } from '../../utils/calculations';
import { User, Plus, Trash2, Scissors, Wallet, DollarSign } from 'lucide-react';

interface MasterCardProps {
  master: MasterEntry;
}

export const MasterCard: React.FC<MasterCardProps> = ({ master }) => {
  const { t, language } = useTranslation();
  const { selectedDate, addClientSession, deleteMaster } = useStore();
  const [feeInput, setFeeInput] = useState<string>('320000');

  const masterName = language === 'uz' && master.nameUz ? master.nameUz : master.name;

  const handleAddSession = () => {
    const fee = Number(feeInput) || 320000;
    addClientSession(selectedDate, master.id, fee);
  };

  const handleDelete = () => {
    deleteMaster(selectedDate, master.id);
  };

  return (
    <div
      data-testid={`master-card-${master.id}`}
      className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col justify-between space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4
              className="text-sm font-bold text-white tracking-wide"
              data-testid={`master-name-${master.id}`}
            >
              {masterName}
            </h4>
            <div className="text-[11px] text-slate-400">
              <span data-testid={`master-clients-${master.id}`}>
                {master.clientCount} {language === 'ru' ? 'клиентов' : 'mijoz'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          data-testid={`delete-master-btn-${master.id}`}
          title={t('journal.actions.delete')}
          aria-label={`${t('journal.actions.delete')} ${masterName}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Financial breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs py-2 px-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-teal-400" />
            <span>{t('journal.masterRevenue')}</span>
          </div>
          <div
            className="text-xs font-semibold text-teal-300 mt-0.5"
            data-testid={`master-revenue-${master.id}`}
          >
            {formatCurrencyUZS(master.revenue, language)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Scissors className="w-3 h-3 text-indigo-400" />
            <span>{t('journal.masterPayout')}</span>
          </div>
          <div
            className="text-xs font-semibold text-indigo-300 mt-0.5"
            data-testid={`master-payout-${master.id}`}
          >
            {formatCurrencyUZS(master.payout, language)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Wallet className="w-3 h-3 text-emerald-400" />
            <span>{t('journal.salonShare')}</span>
          </div>
          <div
            className="text-xs font-semibold text-emerald-300 mt-0.5"
            data-testid={`master-salon-share-${master.id}`}
          >
            {formatCurrencyUZS(master.salonShare, language)}
          </div>
        </div>
      </div>

      {/* Quick session addition */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="number"
          value={feeInput}
          data-testid={`session-fee-input-${master.id}`}
          onChange={(e) => setFeeInput(e.target.value)}
          placeholder={language === 'ru' ? 'Сумма сеанса' : 'Seans summasi'}
          aria-label={language === 'ru' ? 'Сумма сеанса' : 'Seans summasi'}
          className="w-28 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-teal-500"
        />
        <button
          type="button"
          onClick={handleAddSession}
          data-testid={`add-session-btn-${master.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'ru' ? '+ Сеанс' : '+ Seans'}</span>
        </button>
      </div>
    </div>
  );
};
