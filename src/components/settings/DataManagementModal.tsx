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
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 id="data-mgmt-title" className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            <span>{language === 'ru' ? 'Управление данными и резервное копирование' : "Ma'lumotlarni boshqarish va zaxiralash"}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-data-mgmt-btn"
            aria-label={t('journal.actions.cancel')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium text-center">
            {feedback}
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label htmlFor="export-backup-textarea" className="text-xs font-semibold text-slate-300">
              {language === 'ru' ? 'Экспорт резервной копии (JSON)' : 'Zaxira nusxasini eksport qilish (JSON)'}
            </label>
            <button
              type="button"
              onClick={handleExport}
              data-testid="export-backup-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
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
              className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 rounded-xl p-2.5 focus:outline-none"
            />
          )}
        </div>

        {/* Import Section */}
        <div className="space-y-2 pt-3 border-t border-slate-700">
          <label htmlFor="restore-json-input" className="block text-xs font-semibold text-slate-300">
            {language === 'ru' ? 'Восстановление из резервной копии (JSON)' : 'Zaxira nusxasidan tiklash (JSON)'}
          </label>
          <textarea
            id="restore-json-input"
            rows={4}
            value={importJson}
            data-testid="restore-json-input"
            onChange={(e) => setImportJson(e.target.value)}
            placeholder={language === 'ru' ? 'Вставьте JSON резервной копии...' : 'Zaxira nusxasi JSON matnini kiriting...'}
            className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-teal-500"
          />
          <button
            type="button"
            onClick={handleImport}
            data-testid="import-backup-btn"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'ru' ? 'Восстановить данные из JSON' : "Ma'lumotlarni JSON dan tiklash"}</span>
          </button>
        </div>

        {/* Reset Section */}
        <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-300">{language === 'ru' ? 'Сброс к исходным данным' : "Boshlang'ich holatga qaytarish"}</div>
            <div className="text-[11px] text-slate-500">{language === 'ru' ? 'Восстанавливает исходные записи 19-20 ноября' : "19-20 noyabrdagi boshlang'ich yozuvlarni tiklaydi"}</div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            data-testid="reset-baseline-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Сбросить' : 'Qaytarish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
