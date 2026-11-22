import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { X, Database, Download, Upload, RotateCcw } from 'lucide-react';

interface DataManagementModalProps {
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ onClose }) => {
  const { t, language } = useTranslation();
  const { exportData, importData, resetToBaseline } = useStore();
  const [exportJson, setExportJson] = useState<string>('');
  const [importJson, setImportJson] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

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

  const handleExport = () => {
    const json = exportData();
    setExportJson(json);
    setFeedback(language === 'ru' ? 'Резервная копия сформирована' : 'Zaxira nusxasi yaratildi');
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const ok = importData(importJson);
    if (ok) {
      setFeedback('Данные успешно восстановлены!');
      setTimeout(() => onClose(), 800);
    } else {
      setFeedback(language === 'ru' ? 'Ошибка: неверный формат JSON' : "Xatolik: noto'g'ri JSON formati");
    }
  };

  const handleReset = () => {
    if (window.confirm(t('journal.actions.resetConfirm'))) {
      resetToBaseline();
      setFeedback(language === 'ru' ? 'Данные сброшены к 19-20 ноября' : "Ma'lumotlar 19-20 noyabr holatiga qaytarildi");
      setTimeout(() => onClose(), 800);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-mgmt-title"
      data-testid="data-management-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-[26px] w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors">
        {/* iOS Grabber Pill */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <h3 id="data-mgmt-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600 dark:text-[#30d158]" />
            <span>{language === 'ru' ? 'Управление данными и резервное копирование' : "Ma'lumotlarni boshqarish va zaxiralash"}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-data-mgmt-btn"
            aria-label={t('journal.actions.cancel')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-white/70 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30 text-xs font-medium text-center">
            {feedback}
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label htmlFor="export-backup-textarea" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'ru' ? 'Экспорт резервной копии (JSON)' : 'Zaxira nusxasini eksport qilish (JSON)'}
            </label>
            <button
              type="button"
              onClick={handleExport}
              data-testid="export-backup-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Создать бэкап' : 'Nusxa yaratish'}</span>
            </button>
          </div>
          {exportJson && (
            <textarea
              id="export-backup-textarea"
              readOnly
              rows={4}
              value={exportJson}
              data-testid="export-backup-textarea"
              className="w-full bg-slate-50 border border-slate-300 rounded-[14px] p-3 text-xs font-mono text-slate-900 focus:outline-none dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white"
            />
          )}
        </div>

        {/* Import Section */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <label htmlFor="restore-json-input" className="block text-xs font-semibold text-slate-700 dark:text-white/80">
            {language === 'ru' ? 'Импорт резервной копии (JSON)' : 'Zaxira nusxasini import qilish (JSON)'}
          </label>
          <textarea
            id="restore-json-input"
            rows={4}
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            data-testid="restore-json-input"
            placeholder={language === 'ru' ? 'Вставьте сюда скопированный JSON...' : 'Bu yerga JSON nusxasini kiriting...'}
            className="w-full bg-slate-50 border border-slate-300 rounded-[14px] p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 dark:bg-[#2c2c2e] dark:border-white/10 dark:text-white"
          />
          <button
            type="button"
            onClick={handleImport}
            data-testid="import-backup-btn"
            disabled={!importJson.trim()}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-xs font-bold transition-all ${
              importJson.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer'
                : 'bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-white/30 cursor-not-allowed'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Восстановить данные' : "Ma'lumotlarni tiklash"}</span>
          </button>
        </div>

        {/* Factory Reset Section */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-white/50">
            {language === 'ru' ? 'Сброс базы до эталона' : 'Bazani boshlang\'ich holatga qaytarish'}
          </span>
          <button
            type="button"
            onClick={handleReset}
            data-testid="reset-baseline-btn"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[12px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 dark:text-rose-400 dark:border-rose-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Сбросить' : 'Qaytarish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
