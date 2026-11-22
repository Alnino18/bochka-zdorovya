import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import {
  formatDailyTelegramReport,
  sendTelegramReport,
  copyReportToClipboard,
} from '../../utils/telegram';
import {
  X,
  Send,
  Copy,
  CheckCircle2,
  AlertCircle,
  Settings,
  Sparkles,
  Save,
} from 'lucide-react';

interface TelegramReportModalProps {
  onClose: () => void;
}

export const TelegramReportModal: React.FC<TelegramReportModalProps> = ({ onClose }) => {
  const { language } = useTranslation();
  const { currentRecord, summary, telegramConfig, updateTelegramConfig } = useStore();

  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');
  const [botToken, setBotToken] = useState(telegramConfig?.botToken || '');
  const [chatId, setChatId] = useState(telegramConfig?.chatId || '');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const report = formatDailyTelegramReport(currentRecord, summary, language);

  const handleCopy = async () => {
    const ok = await copyReportToClipboard(report.plainText);
    if (ok) {
      setCopied(true);
      setStatusMessage({
        type: 'success',
        text:
          language === 'ru'
            ? 'Отчет скопирован в буфер обмена!'
            : 'Hisobot buferga muvaffaqiyatli nusxalandi!',
      });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSendTelegram = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      setActiveTab('settings');
      setStatusMessage({
        type: 'error',
        text:
          language === 'ru'
            ? 'Пожалуйста, укажите Bot Token и Chat ID в настройках Telegram.'
            : 'Iltimos, Telegram sozlamalarida Bot Token va Chat ID ni kiriting.',
      });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    const res = await sendTelegramReport(telegramConfig.botToken, telegramConfig.chatId, report.html);
    setIsSending(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text:
          language === 'ru'
            ? 'Отчет успешно отправлен в Telegram канал/чат!'
            : 'Hisobot Telegram kanal/chatga muvaffaqiyatli yuborildi!',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text:
          language === 'ru'
            ? `Ошибка отправки в Telegram: ${res.error}. Вы можете скопировать текст отчета.`
            : `Telegramga yuborishda xatolik: ${res.error}. Hisobot matnini nusxalashingiz mumkin.`,
      });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTelegramConfig({
      botToken: botToken.trim(),
      chatId: chatId.trim(),
    });
    setStatusMessage({
      type: 'success',
      text:
        language === 'ru'
          ? 'Настройки Telegram сохранены в памяти!'
          : 'Telegram sozlamalari saqlandi!',
    });
    setActiveTab('preview');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="telegram-report-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-[26px] w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-5 my-8 transition-colors">
        {/* iOS Grabber Pill */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-blue-50 text-blue-600 dark:bg-[#0a84ff]/20 dark:text-[#0a84ff] flex items-center justify-center border border-blue-200 dark:border-[#0a84ff]/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/80 dark:border-white/10 mb-0.5">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-[#0a84ff]" />
                <span>Telegram Bot Integration</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {language === 'ru' ? 'Ежедневный кассовый отчет' : 'Kunlik kassa hisoboti'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-slate-100 dark:bg-[#2c2c2e] p-1 rounded-[12px] border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
                }`}
              >
                {language === 'ru' ? 'Отчет' : 'Hisobot'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                data-testid="telegram-settings-tab-btn"
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{language === 'ru' ? 'Настройки' : 'Sozlamalar'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              data-testid="close-telegram-modal-btn"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-white/70 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/40'
                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-500/40'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: REPORT PREVIEW & ACTIONS */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto select-all shadow-inner">
              {report.plainText}
            </div>

            {/* Quick Status of Configuration */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Telegram Bot:</span>
                {telegramConfig?.botToken && telegramConfig?.chatId ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'ru' ? 'Настроен' : 'Sozlangan'}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="text-amber-600 dark:text-amber-400 underline hover:text-amber-500"
                  >
                    {language === 'ru' ? 'Не настроен (нажмите для ввода Token & Chat ID)' : 'Sozlanmagan (kiriting)'}
                  </button>
                )}
              </div>

              {telegramConfig?.chatId && (
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  Target: {telegramConfig.chatId}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                data-testid="copy-telegram-report-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>
                  {copied
                    ? language === 'ru' ? 'Скопировано!' : 'Nusxalandi!'
                    : language === 'ru' ? 'Скопировать отчет' : 'Hisobotdan nusxa olish'}
                </span>
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleSendTelegram}
                data-testid="confirm-send-telegram-btn"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                  isSending
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                }`}
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {isSending
                    ? language === 'ru' ? 'Отправка...' : 'Yuborilmoqda...'
                    : language === 'ru' ? 'Отправить в Telegram' : 'Telegramga yuborish'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TELEGRAM SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-4" data-testid="telegram-settings-modal">
            <div className="bg-blue-50 dark:bg-sky-950/30 border border-blue-200 dark:border-sky-800/40 rounded-2xl p-4 text-xs text-blue-900 dark:text-sky-200 leading-relaxed space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-sky-300">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ru' ? 'Как настроить Telegram бота:' : 'Telegram botni sozlash:'}</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                <li>{language === 'ru' ? 'Откройте @BotFather в Telegram и создайте бота командой /newbot.' : 'Telegramda @BotFather ni oching va /newbot buyrug\'i bilan bot yarating.'}</li>
                <li>{language === 'ru' ? 'Скопируйте выданный HTTP API Token и вставьте в поле ниже.' : 'Berilgan HTTP API Tokenni nusxalab quyidagi maydonga kiriting.'}</li>
                <li>{language === 'ru' ? 'Добавьте бота администратором в ваш канал/чат или начните диалог с ботом.' : 'Botni kanalingiz yoki guruhingizga admin qiling va Chat ID ni kiriting.'}</li>
                <li>{language === 'ru' ? 'Chat ID: например -1001234567890 (для каналов/групп) или ваш личный ID.' : 'Chat ID: masalan -1001234567890 (kanallar/guruhlar) yoki shaxsiy ID.'}</li>
              </ol>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ru' ? 'Bot Token (от @BotFather)' : 'Bot Token (@BotFather dan)'}
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                data-testid="telegram-bot-token-input"
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ru' ? 'Chat ID (ID канала, группы или пользователя)' : 'Chat ID (kanal, guruh yoki foydalanuvchi ID si)'}
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                data-testid="telegram-chat-id-input"
                placeholder="-1001234567890 или @channel_name"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {language === 'ru' ? 'Назад' : 'Orqaga'}
              </button>
              <button
                type="submit"
                data-testid="save-telegram-config-btn"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'ru' ? 'Сохранить настройки' : 'Sozlamalarni saqlash'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
