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
      className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 shadow-sm dark:shadow-lg flex flex-col justify-between space-y-3 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 font-bold text-xs">
            {masterName.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div>
            <h4
              className="text-sm font-bold text-slate-900 dark:text-white tracking-wide"
              data-testid={`master-name-${master.id}`}
            >
              {masterName}
            </h4>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
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
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Financial breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-slate-800">
        <div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{t('journal.masterRevenue')}</span>
          </div>
          <div
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5 truncate font-mono"
            data-testid={`master-revenue-${master.id}`}
          >
            {formatCurrencyUZS(master.revenue, language)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Scissors className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>{t('journal.masterPayout')}</span>
          </div>
          <div
            className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mt-0.5 truncate font-mono"
            data-testid={`master-payout-${master.id}`}
          >
            {formatCurrencyUZS(master.payout, language)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Wallet className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>{t('journal.salonShare')}</span>
          </div>
          <div
            className="text-xs font-semibold text-teal-700 dark:text-teal-300 mt-0.5 truncate font-mono"
            data-testid={`master-salon-share-${master.id}`}
          >
            {formatCurrencyUZS(master.salonShare, language)}
          </div>
        </div>
      </div>

      {/* Quick session add */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
        <input
          type="number"
          value={feeInput}
          onChange={(e) => setFeeInput(e.target.value)}
          data-testid={`session-price-input-${master.id}`}
          className="w-24 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-900 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAddSession}
          data-testid={`add-session-btn-${master.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('journal.addClient')}</span>
        </button>
      </div>
    </div>
  );
};
