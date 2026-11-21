import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '../../src/App';
import {
  STORAGE_KEY,
  SERVICES_STORAGE_KEY,
  TELEGRAM_STORAGE_KEY,
} from '../../src/context/StoreContext';
import { BASELINE_NOV_19 } from '../../src/constants/baselineData';
import {
  formatDailyTelegramReport,
  sendTelegramReport,
  copyReportToClipboard,
} from '../../src/utils/telegram';
import { calculateDaySummary } from '../../src/utils/calculations';

describe('Feature F14: Modern Redesign & Extended POS Features', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([BASELINE_NOV_19]));
  });

  describe('1. Terminology Validation: Massajistka (UZ) / Массажистка (RU)', () => {
    it('T1-F14-01: verifies "Массажистка" terminology in Russian UI', () => {
      render(<App initialDate="2026-11-19" />);

      // Switch to RU
      fireEvent.click(screen.getByTestId('lang-btn-ru'));

      // POS step 1 title
      expect(screen.getByText('1. Выберите массажистку')).toBeInTheDocument();

      // Quick add button
      expect(screen.getByTestId('add-master-btn')).toHaveTextContent(/Новая массажистка/);

      // Radiogroup aria-label
      expect(screen.getByRole('radiogroup', { name: /Massajistkas/i })).toBeInTheDocument();

      // Master cards section header
      expect(screen.getByText(/Массажистки на смене/)).toBeInTheDocument();

      // Open Add Massajistka modal
      fireEvent.click(screen.getByTestId('add-master-btn'));
      expect(screen.getByTestId('add-master-modal')).toBeInTheDocument();
      expect(screen.getAllByText(/Добавить массажистку/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('master-name-input')).toBeInTheDocument();
    });

    it('T1-F14-02: verifies "Massajistka" terminology in Uzbek UI', () => {
      render(<App initialDate="2026-11-19" />);

      // Switch to UZ
      fireEvent.click(screen.getByTestId('lang-btn-uz'));

      // POS step 1 title
      expect(screen.getByText('1. Massajistkani tanlang')).toBeInTheDocument();

      // Quick add button
      expect(screen.getByTestId('add-master-btn')).toHaveTextContent(/Yangi massajistka/);

      // Section titles
      expect(screen.getByText(/Smenadagi massajistkalar/)).toBeInTheDocument();

      // Open Add Massajistka modal
      fireEvent.click(screen.getByTestId('add-master-btn'));
      expect(screen.getByTestId('add-master-modal')).toBeInTheDocument();
      expect(screen.getAllByText(/Massajistka qo'shish/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('master-name-input')).toBeInTheDocument();
    });
  });

  describe('2. Price List Editor Modal & Dynamic Catalog Management', () => {
    it('T1-F14-03: opens Price Editor Modal from Price List tab and lists services', () => {
      render(<App initialDate="2026-11-19" />);

      // Navigate to Price List tab
      const priceListTabs = screen.getAllByText(/Narxlar ro'yxati|Прейскурант/i);
      fireEvent.click(priceListTabs[0]);

      // Click Open Price Editor button
      const openBtn = screen.getByTestId('open-price-editor-btn');
      expect(openBtn).toBeInTheDocument();
      fireEvent.click(openBtn);

      // Verify Modal is opened
      expect(screen.getByTestId('price-editor-modal')).toBeInTheDocument();
      expect(screen.getByText(/Редактор прейскуранта|Narxlar ro'yxati muharriri/i)).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByTestId('close-price-editor-btn'));
      expect(screen.queryByTestId('price-editor-modal')).toBeNull();
    });

    it('T1-F14-04: allows adding a new service category and saving to localStorage', () => {
      render(<App initialDate="2026-11-19" />);

      // Navigate to Price List tab
      fireEvent.click(screen.getAllByText(/Narxlar ro'yxati|Прейскурант/i)[0]);
      fireEvent.click(screen.getByTestId('open-price-editor-btn'));

      // Click Add Category button
      fireEvent.click(screen.getByTestId('add-new-service-category-btn'));

      // Fill in new service fields
      const ruNameInput = screen.getByTestId('new-category-name-ru-input');
      const uzNameInput = screen.getByTestId('new-category-name-uz-input');
      const durationInput = screen.getByTestId('new-category-duration-input');
      const priceInput = screen.getByTestId('new-category-price-input');

      fireEvent.change(ruNameInput, { target: { value: 'Королевский спа ритуал' } });
      fireEvent.change(uzNameInput, { target: { value: 'Qirollik spa marosimi' } });
      fireEvent.change(durationInput, { target: { value: '90' } });
      fireEvent.change(priceInput, { target: { value: '550000' } });

      // Submit form
      fireEvent.click(screen.getByTestId('save-new-category-btn'));

      // Verify new service appears in modal
      expect(screen.getAllByText('Королевский спа ритуал').length).toBeGreaterThanOrEqual(1);

      // Verify saved in localStorage
      const savedCustom = localStorage.getItem(SERVICES_STORAGE_KEY);
      expect(savedCustom).not.toBeNull();
      const parsed = JSON.parse(savedCustom!);
      expect(parsed.some((c: any) => c.nameRu === 'Королевский спа ритуал')).toBe(true);
    });

    it('T1-F14-05: allows editing existing service option price and resetting to defaults', () => {
      render(<App initialDate="2026-11-19" />);

      fireEvent.click(screen.getAllByText(/Narxlar ro'yxati|Прейскурант/i)[0]);
      fireEvent.click(screen.getByTestId('open-price-editor-btn'));

      // Find an option price input for Category 1 (40 min)
      const priceInput = screen.getByTestId('input-price-1-40');
      fireEvent.change(priceInput, { target: { value: '320000' } });

      // Verify localStorage updated
      const saved = JSON.parse(localStorage.getItem(SERVICES_STORAGE_KEY) || '[]');
      const cat1 = saved.find((c: any) => c.categoryNumber === 1);
      expect(cat1.options.find((o: any) => o.durationMinutes === 40).priceUZS).toBe(320000);

      // Test reset to default
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      fireEvent.click(screen.getByTestId('reset-price-list-btn'));

      expect(localStorage.getItem(SERVICES_STORAGE_KEY)).toBeNull();
      confirmSpy.mockRestore();
    });
  });

  describe('3. Order Edit & Modification Flow', () => {
    it('T1-F14-06: opens EditOrderModal, adjusts price, adds drink/tea, and changes massajistka', () => {
      render(<App initialDate="2026-11-19" />);

      // Baseline Nov 19: Masseur Iro has order ord-iro-19-1 (370 000 UZS)
      const editBtn = screen.getByTestId('edit-order-btn-ord-iro-19-1');
      expect(editBtn).toBeInTheDocument();
      fireEvent.click(editBtn);

      // Verify modal is open
      expect(screen.getByTestId('edit-order-modal')).toBeInTheDocument();

      // Change price to 420 000 UZS
      const priceInput = screen.getByTestId('edit-order-price-input');
      fireEvent.change(priceInput, { target: { value: '420000' } });

      // Add a bar item preset: Herbal Tea (+20 000 UZS)
      const teaPresetBtn = screen.getByTestId('edit-order-add-bar-20000');
      fireEvent.click(teaPresetBtn);
      expect(screen.getAllByText(/Чай/).length).toBeGreaterThanOrEqual(1);

      // Reassign order from Iro to Max
      const maxMasterBtn = screen.getByTestId('edit-order-master-btn-m-max-19');
      fireEvent.click(maxMasterBtn);

      // Save order changes
      fireEvent.click(screen.getByTestId('save-order-edit-btn'));

      // Modal closes
      expect(screen.queryByTestId('edit-order-modal')).toBeNull();

      // Verify Iro's client count decreased from 2 to 1
      const iroCard = screen.getByTestId('master-card-m-iro-19');
      expect(within(iroCard).getByTestId('master-clients-m-iro-19')).toHaveTextContent('1');

      // Verify Max's client count increased from 3 to 4
      const maxCard = screen.getByTestId('master-card-m-max-19');
      expect(within(maxCard).getByTestId('master-clients-m-max-19')).toHaveTextContent('4');

      // Verify Bar revenue was updated with +20 000 UZS
      expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('20 000');
    });
  });

  describe('4. Telegram Daily Report Generation & Dispatch', () => {
    it('T1-F14-07: formats accurate plain text and HTML daily reports with massajistkas and salon balance', () => {
      const summary = calculateDaySummary(BASELINE_NOV_19);

      // Test Russian report formatting
      const ruReport = formatDailyTelegramReport(BASELINE_NOV_19, summary, 'ru');
      expect(ruReport.plainText).toContain('🌿 БОЧКА ЗДОРОВЬЯ — ДНЕВНОЙ КАССОВЫЙ ОТЧЕТ 🌿');
      expect(ruReport.plainText).toContain('Массажистки на смене (3):');
      expect(ruReport.plainText).toContain('Иро: 2 кл | 470 000 UZS (Выплата: 200 000 UZS)');
      expect(ruReport.plainText).toContain('В КАССЕ (Наличные): 1 640 000 UZS');
      expect(ruReport.plainText).toContain('ЧИСТАЯ ПРИБЫЛЬ САЛОНА: 1 040 000 UZS');

      expect(ruReport.html).toContain('<b>БОЧКА ЗДОРОВЬЯ — ДНЕВНОЙ КАССОВЫЙ ОТЧЕТ</b>');
      expect(ruReport.html).toContain('<b>1 640 000 UZS</b>');

      // Test Uzbek report formatting
      const uzReport = formatDailyTelegramReport(BASELINE_NOV_19, summary, 'uz');
      expect(uzReport.plainText).toContain('🌿 BOCHKA ZDOROVYA — KUNLIK KASSA HISOBOTI 🌿');
      expect(uzReport.plainText).toContain('Smenadagi massajistkalar (3):');
      expect(uzReport.plainText).toContain("KASSADAGI SOF QOLDIQ: 1 640 000 so'm");
      expect(uzReport.plainText).toContain("SALONNING SOF FOYDASI: 1 040 000 so'm");
    });

    it('T1-F14-08: sends report to Telegram Bot API with token & chat ID', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ ok: true }),
      });
      global.fetch = mockFetch;

      const res = await sendTelegramReport(
        '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        '-1001987654321',
        '<b>Test Message</b>'
      );

      expect(res.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/sendMessage',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: '-1001987654321',
            text: '<b>Test Message</b>',
            parse_mode: 'HTML',
          }),
        })
      );
    });

    it('T1-F14-09: handles Telegram API network / authorization errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: async () => ({ ok: false, description: 'Unauthorized' }),
      });

      const res = await sendTelegramReport('invalid-token', '-100123', '<b>Hello</b>');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized');

      // Test empty credentials
      const emptyRes = await sendTelegramReport('', '', 'test');
      expect(emptyRes.success).toBe(false);
      expect(emptyRes.error).toContain('Bot Token and Chat ID must be configured');
    });

    it('T1-F14-10: manages Telegram modal settings and clipboard copy', async () => {
      render(<App initialDate="2026-11-19" />);

      // Click Telegram button in POS header
      const telegramBtn = screen.getByTestId('send-telegram-btn');
      fireEvent.click(telegramBtn);

      // Verify modal is open
      expect(screen.getByTestId('telegram-report-modal')).toBeInTheDocument();

      // Switch to settings tab
      fireEvent.click(screen.getByTestId('telegram-settings-tab-btn'));
      expect(screen.getByTestId('telegram-settings-modal')).toBeInTheDocument();

      // Configure Bot Token & Chat ID
      const tokenInput = screen.getByTestId('telegram-bot-token-input');
      const chatIdInput = screen.getByTestId('telegram-chat-id-input');

      fireEvent.change(tokenInput, { target: { value: '987654321:XYZ-Token-Test' } });
      fireEvent.change(chatIdInput, { target: { value: '@bochka_daily_channel' } });

      // Save settings
      fireEvent.click(screen.getByTestId('save-telegram-config-btn'));

      // Check localStorage updated
      const savedConfig = JSON.parse(localStorage.getItem(TELEGRAM_STORAGE_KEY) || '{}');
      expect(savedConfig.botToken).toBe('987654321:XYZ-Token-Test');
      expect(savedConfig.chatId).toBe('@bochka_daily_channel');

      // Test copy to clipboard helper
      const copySuccess = await copyReportToClipboard('Daily Report Test');
      expect(typeof copySuccess).toBe('boolean');

      // Close modal
      fireEvent.click(screen.getByTestId('close-telegram-modal-btn'));
      expect(screen.queryByTestId('telegram-report-modal')).toBeNull();
    });
  });
});
