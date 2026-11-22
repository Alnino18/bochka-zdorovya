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
      className="bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 rounded-[22px] p-4 sm:p-5 shadow-sm dark:shadow-xl flex flex-col justify-between space-y-3.5 transition-all"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[14px] bg-emerald-50 text-emerald-600 dark:bg-[#30d158]/20 dark:text-[#30d158] flex items-center justify-center border border-emerald-200 dark:border-[#30d158]/30 font-bold text-xs">
            {masterName.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div>
            <h4
              className="text-sm font-bold text-slate-900 dark:text-white tracking-wide"
              data-testid={`master-name-${master.id}`}
            >
              {masterName}
            </h4>
            <div className="text-[11px] text-emerald-600 dark:text-[#30d158] font-bold">
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
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:text-white/50 dark:hover:text-rose-400 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Financial breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs py-2 px-2.5 rounded-[16px] bg-slate-50 border border-slate-200 dark:bg-[#2c2c2e] dark:border-white/5">
        <div>
          <div className="text-[10px] text-slate-500 dark:text-white/60 flex items-center gap-1 font-medium">
            <DollarSign className="w-3 h-3 text-emerald-600 dark:text-[#30d158]" />
            <span>{t('journal.masterRevenue')}</span>
          </div>
          <div
            className="text-xs font-bold text-emerald-700 dark:text-[#30d158] mt-0.5 truncate font-mono"
            data-testid={`master-revenue-${master.id}`}
          >
            {formatCurrencyUZS(master.revenue, language)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 dark:text-white/60 flex items-center gap-1 font-medium">
            <Scissors className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>{t('journal.masterPayout')}</span>
          </div>
          <div
            className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 truncate font-mono"
            data-testid={`master-payout-${master.id}`}
          >
            {formatCurrencyUZS(master.payout, language)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 dark:text-white/60 flex items-center gap-1 font-medium">
            <Wallet className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>{t('journal.salonShare')}</span>
          </div>
          <div
            className="text-xs font-bold text-teal-700 dark:text-teal-300 mt-0.5 truncate font-mono"
            data-testid={`master-salon-share-${master.id}`}
          >
            {formatCurrencyUZS(master.salonShare, language)}
          </div>
        </div>
      </div>

      {/* Quick session add */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-white/10">
        <input
          type="number"
          value={feeInput}
          onChange={(e) => setFeeInput(e.target.value)}
          data-testid={`session-price-input-${master.id}`}
          className="w-24 bg-slate-50 border border-slate-300 dark:bg-[#2c2c2e] dark:border-white/10 rounded-[12px] px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={handleAddSession}
          data-testid={`add-session-btn-${master.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#30d158] dark:hover:bg-[#28b84d] dark:text-black text-xs font-bold rounded-[12px] shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('journal.addClient')}</span>
        </button>
      </div>
    </div>
  );
};
