import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { X, Database, Download, Upload, RotateCcw } from 'lucide-react';

interface DataManagementModalProps {
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { exportData, importData, resetToBaseline } = useStore();
  const [exportJson, setExportJson] = useState<string>('');
  const [importJson, setImportJson] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const handleExport = () => {
    const json = exportData();
    setExportJson(json);
    setFeedback('Резервная копия сформирована');
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const ok = importData(importJson);
    if (ok) {
      setFeedback('Данные успешно восстановлены!');
      setTimeout(() => onClose(), 800);
    } else {
      setFeedback('Ошибка: неверный формат JSON');
    }
  };

  const handleReset = () => {
    if (window.confirm(t('journal.actions.resetConfirm'))) {
      resetToBaseline();
      setFeedback('Данные сброшены к 19-20 ноября');
      setTimeout(() => onClose(), 800);
    }
  };

  return (
    <div
      data-testid="data-management-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            <span>Управление данными и резервное копирование</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-data-mgmt-btn"
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
            <label className="text-xs font-semibold text-slate-300">
              Экспорт резервной копии (JSON)
            </label>
            <button
              type="button"
              onClick={handleExport}
              data-testid="export-backup-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Создать бэкап</span>
            </button>
          </div>
          {exportJson && (
            <textarea
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
          <label className="block text-xs font-semibold text-slate-300">
            Восстановление из резервной копии (JSON)
          </label>
          <textarea
            rows={4}
            value={importJson}
            data-testid="restore-json-input"
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Вставьте JSON резервной копии..."
            className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-teal-500"
          />
          <button
            type="button"
            onClick={handleImport}
            data-testid="import-backup-btn"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Восстановить данные из JSON</span>
          </button>
        </div>

        {/* Reset Section */}
        <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-300">Сброс к исходным данным</div>
            <div className="text-[11px] text-slate-500">Восстанавливает исходные записи 19-20 ноября</div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            data-testid="reset-baseline-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить</span>
          </button>
        </div>
      </div>
    </div>
  );
};
