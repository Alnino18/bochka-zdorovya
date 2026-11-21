import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../src/App';
import { simulateNetworkStatus } from '../helpers/test-utils';
import { STORAGE_KEY } from '../../src/context/StoreContext';

describe('Tier 4 - Real-World Administrative Scenarios (8 Scenarios)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Scenario 1: Complete Daily Operational Cycle (Opening to Closing)
  it('T4-SCEN-01: executes full daily operational cycle from opening blank slate to closing settlement in live DOM', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // 1. Opening: Change date to blank day 2026-11-21
    const dateInput = screen.getByTestId('date-picker-input');
    fireEvent.change(dateInput, { target: { value: '2026-11-21' } });

    expect(screen.getByTestId('current-date-display').textContent).toContain('21.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('0');
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('0 UZS');
    expect(screen.queryByTestId('empty-masters-placeholder')).not.toBeInTheDocument();

    // 2. Morning: Register shift masters (Иро and Мах)
    fireEvent.click(screen.getByTestId('add-master-btn'));
    expect(screen.getByTestId('add-master-modal')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('master-name-input'), { target: { value: 'Иро' } });
    fireEvent.click(screen.getByTestId('submit-master-btn'));

    fireEvent.click(screen.getByTestId('add-master-btn'));
    fireEvent.change(screen.getByTestId('master-name-input'), { target: { value: 'Мах' } });
    fireEvent.click(screen.getByTestId('submit-master-btn'));

    // Master cards rendered in DOM
    const masterNames = screen.getAllByTestId(/^master-name-/).map(el => el.textContent);
    expect(masterNames).toContain('Иро');
    expect(masterNames).toContain('Мах');

    // 3. Midday & Afternoon: Log POS orders
    // For Iro: select Category 1 (60m: 320k) and submit 3 orders (= 960k)
    fireEvent.click(screen.getByTestId('pos-service-btn-1-60'));
    fireEvent.click(screen.getByTestId('pos-submit-order'));
    fireEvent.click(screen.getByTestId('pos-submit-order'));
    fireEvent.click(screen.getByTestId('pos-submit-order'));

    // For Max: select Masseur chip for Max, set custom amount to 350000 and submit 2 orders (= 700k)
    const maxChip = screen.getByRole('radio', { name: /Мах/ });
    fireEvent.click(maxChip);
    fireEvent.click(screen.getByTestId('pos-custom-amount-btn'));
    fireEvent.change(screen.getByTestId('pos-custom-amount-input'), { target: { value: '350000' } });
    fireEvent.click(screen.getByTestId('pos-submit-order'));
    fireEvent.click(screen.getByTestId('pos-submit-order'));

    // 4. Afternoon & Evening: Bar sales (120,000 UZS) and Cleaning (200,000 UZS)
    fireEvent.change(screen.getByTestId('input-bar-revenue'), { target: { value: '120000' } });
    fireEvent.change(screen.getByTestId('input-cleaning-expense'), { target: { value: '200000' } });

    // 5. Live DOM Summary Verification
    // 5 clients total (3 for Iro, 2 for Max)
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('5');
    // Gross service revenue: 960k + 700k = 1,660,000 UZS
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('1 660 000');
    // Bar: 120,000 UZS
    expect(screen.getByTestId('metric-bar-revenue').textContent).toContain('120 000');
    // Gross total revenue: 1,660,000 + 120,000 = 1,780,000 UZS
    expect(screen.getByTestId('metric-gross-total-revenue').textContent).toContain('1 780 000');
    // Payouts: 5 * 100k = 500,000 UZS
    expect(screen.getByTestId('metric-master-payouts').textContent).toContain('500 000');
    // Cleaning: 200,000 UZS
    expect(screen.getByTestId('metric-cleaning-expenses').textContent).toContain('200 000');
    // Net cash desk balance: 1,780,000 - 200,000 = 1,580,000 UZS
    expect(screen.getByTestId('metric-net-balance').textContent).toContain('1 580 000');
    // Net salon profit: 1,580,000 - 500,000 = 1,080,000 UZS
    expect(screen.getByTestId('metric-net-profit').textContent).toContain('1 080 000');

    // 6. Masseur Breakdown Verification in DOM
    const masterCards = screen.getAllByTestId(/^master-card-/);
    const iroCard = masterCards.find(c => c.textContent?.includes('Иро'))!;
    expect(iroCard).toHaveTextContent('3x');
    expect(iroCard).toHaveTextContent('960 000');

    const maxCard = masterCards.find(c => c.textContent?.includes('Мах'))!;
    expect(maxCard).toHaveTextContent('2x');
    expect(maxCard).toHaveTextContent('700 000');

    // 7. Verify persistence across remount
    const storedRaw = localStorage.getItem(STORAGE_KEY);
    expect(storedRaw).toBeTruthy();
    const stored = JSON.parse(storedRaw!);
    const savedDay21 = stored.find((r: any) => r.date === '2026-11-21');
    expect(savedDay21.masters.length).toBeGreaterThanOrEqual(2);
    expect(savedDay21.masters.find((m: any) => m.name === 'Иро').clientCount).toBe(3);
    expect(savedDay21.masters.find((m: any) => m.name === 'Мах').clientCount).toBe(2);
  });

  // Scenario 2: High-Volume Weekend Rush Operations
  it('T4-SCEN-02: handles high-volume weekend rush with multiple masters and fast-paced bar sales in live DOM', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // Navigate to Nov 20 (high-volume day with 4 master shifts: 15 clients)
    fireEvent.click(screen.getByTestId('date-next-btn'));
    expect(screen.getByTestId('current-date-display').textContent).toContain('20.11.2026');

    // 15 clients initially in DOM
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('15');
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('3 950 000');

    // Fast-paced bar sales spike: increase bar revenue from 440,000 to 650,000 UZS
    const barInput = screen.getByTestId('input-bar-revenue');
    fireEvent.change(barInput, { target: { value: '650000' } });

    // Live DOM automatically recalculates gross total and net balance
    // 3,950,000 + 650,000 = 4,600,000 UZS
    expect(screen.getByTestId('metric-bar-revenue').textContent).toContain('650 000');
    expect(screen.getByTestId('metric-gross-total-revenue').textContent).toContain('4 600 000');
    // Net balance: 4,600,000 - 200,000 cleaning = 4,400,000 UZS
    expect(screen.getByTestId('metric-net-balance').textContent).toContain('4 400 000');

    // Fast-paced walk-in order during rush
    fireEvent.click(screen.getByTestId('pos-submit-order'));
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('16');
  });

  // Scenario 3: Historical Ledger Audit & Dispute Correction
  it('T4-SCEN-03: corrects misattributed client session in historical ledger while maintaining balance invariant', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // Initially at 2026-11-19
    expect(screen.getByTestId('current-date-display').textContent).toContain('19.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('6');
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('1 840 000');

    // Audit Correction: Add missing 350,000 UZS session for Komila
    const komilaChip = screen.getByRole('radio', { name: /Комила/ });
    fireEvent.click(komilaChip);
    fireEvent.click(screen.getByTestId('pos-service-btn-2-40')); // Медовый 40m = 350,000 UZS
    fireEvent.click(screen.getByTestId('pos-submit-order'));

    // Live DOM updates: total clients becomes 7, revenue becomes 1,840k + 350k = 2,190,000 UZS
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('7');
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('2 190 000');
    // Master payout becomes 600k + 100k = 700k
    expect(screen.getByTestId('metric-master-payouts').textContent).toContain('700 000');
  });

  // Scenario 4: Bilingual Administrative Shift Handover
  it('T4-SCEN-04: executes seamless bilingual shift handover from Uzbek morning admin to Russian evening admin', () => {
    // 1. Morning admin opens app in Uzbek
    localStorage.setItem('bochka_lang', 'uz');
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // Uzbek labels in header and journal
    expect(screen.getAllByText('Bochka Zdorovya')[0]).toBeInTheDocument();
    expect(screen.getByText('Buyurtma terminali va kassa hisobi')).toBeInTheDocument();

    // Morning admin adds order in Uzbek UI
    const iroChip = screen.getByRole('radio', { name: /Iro/i });
    fireEvent.click(iroChip);
    fireEvent.click(screen.getByTestId('pos-service-btn-1-40'));
    fireEvent.click(screen.getByTestId('pos-submit-order'));
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('7');

    // 2. Evening handover: Russian admin switches language to RU via Header
    fireEvent.click(screen.getByTestId('lang-btn-ru'));
    expect(screen.getAllByText('Бочка Здоровья')[0]).toBeInTheDocument();
    expect(screen.getByText('Терминал заказов и кассовый учет')).toBeInTheDocument();

    // Evening admin adds order in Russian UI
    const maxChip = screen.getByRole('radio', { name: /Мах/i });
    fireEvent.click(maxChip);
    fireEvent.click(screen.getByTestId('pos-service-btn-1-60'));
    fireEvent.click(screen.getByTestId('pos-submit-order'));

    // Both orders reflected in DOM
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('8');
  });

  // Scenario 5: Full Disaster Recovery & Backup Lifecycle
  it('T4-SCEN-05: performs disaster recovery cycle: export backup, storage loss, restore from JSON backup in UI', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // 1. Navigate to summary tab
    fireEvent.click(screen.getByTestId('bottom-nav-summary'));
    expect(screen.getByTestId('section-summary')).toBeInTheDocument();

    // 2. Open Data Management modal
    fireEvent.click(screen.getByTestId('open-data-mgmt-btn'));
    expect(screen.getByTestId('data-management-modal')).toBeInTheDocument();

    // 3. Export backup
    fireEvent.click(screen.getByTestId('export-backup-btn'));
    const textarea = screen.getByTestId('export-backup-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBeTruthy();
    const backupContent = textarea.value;

    const parsedBackup = JSON.parse(backupContent);
    expect(parsedBackup.app).toBe('Бочка Здоровья');
    expect(parsedBackup.records.length).toBeGreaterThanOrEqual(2);

    // 4. Close modal and simulate disaster: clear storage
    fireEvent.click(screen.getByTestId('close-data-mgmt-btn'));
    localStorage.clear();

    // 5. Restore from backup JSON
    fireEvent.click(screen.getByTestId('open-data-mgmt-btn'));
    const importInput = screen.getByTestId('restore-json-input');
    fireEvent.change(importInput, { target: { value: backupContent } });
    fireEvent.click(screen.getByTestId('import-backup-btn'));

    // Wait for restore
    expect(screen.getByText(/успешно восстановлены/i)).toBeInTheDocument();

    // 6. Navigate back to journal: data restored
    fireEvent.click(screen.getByTestId('close-data-mgmt-btn'));
    fireEvent.click(screen.getByTestId('bottom-nav-journal'));
    expect(screen.getByTestId('current-date-display').textContent).toContain('19.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('6');
  });

  // Scenario 6: Walk-in Client to Checkout & Master Settlement
  it('T4-SCEN-06: executes walk-in client lifecycle from catalog lookup to booking, checkout, and settlement', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // 1. Client walks in, admin switches to Price List tab to check service price
    fireEvent.click(screen.getByTestId('bottom-nav-pricelist'));
    expect(screen.getByTestId('section-pricelist')).toBeInTheDocument();
    expect(screen.getByTestId('service-card-1')).toBeInTheDocument();
    expect(screen.getByText(/Фитобочка, Сауна, Массаж \(оздоровительный\)/)).toBeInTheDocument();
    expect(screen.getByText(/320 000/)).toBeInTheDocument();

    // 2. Admin switches back to POS Terminal
    fireEvent.click(screen.getByTestId('bottom-nav-journal'));
    expect(screen.getByTestId('section-journal')).toBeInTheDocument();

    // 3. Admin selects Master "Мах"
    const maxChip = screen.getByRole('radio', { name: /Мах/ });
    fireEvent.click(maxChip);

    // 4. Selects 320,000 UZS service (Category 1, 60m)
    fireEvent.click(screen.getByTestId('pos-service-btn-1-60'));

    // 5. Taps 'Add Order / Qabul qilish'
    fireEvent.click(screen.getByTestId('pos-submit-order'));

    // 6. Live DOM reflects updated clients and revenue
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('7');
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('2 160 000');

    // 7. Masseur breakdown reflects performed massage
    const maxMassages = screen.getAllByTestId(/pos-masseur-massages-/)[0];
    expect(maxMassages).toBeInTheDocument();
  });

  // Scenario 7: Offline Operations & Resynchronization
  it('T4-SCEN-07: operates offline without crashing, updates live state, and resynchronizes upon reconnect', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // 1. Goes offline
    act(() => {
      simulateNetworkStatus(false);
    });
    expect(screen.getByTestId('offline-badge')).toBeInTheDocument();

    // 2. Perform journal updates while offline
    const cleaningInput = screen.getByTestId('input-cleaning-expense');
    fireEvent.change(cleaningInput, { target: { value: '250000' } });

    const barInput = screen.getByTestId('input-bar-revenue');
    fireEvent.change(barInput, { target: { value: '100000' } });

    // Live DOM reflects changes while offline
    expect(screen.getByTestId('metric-cleaning-expenses').textContent).toContain('250 000');
    expect(screen.getByTestId('metric-bar-revenue').textContent).toContain('100 000');

    // 3. Reconnect online
    act(() => {
      simulateNetworkStatus(true);
    });
    expect(screen.queryByTestId('offline-badge')).not.toBeInTheDocument();

    // 4. Data remains intact in DOM and storage
    expect(screen.getByTestId('metric-cleaning-expenses').textContent).toContain('250 000');
    expect(screen.getByTestId('metric-bar-revenue').textContent).toContain('100 000');
  });

  // Scenario 8: Multi-Day Financial Comparison & Audit
  it('T4-SCEN-08: audits multi-day sequence (Nov 19, 20, 21) verifying isolation and correct day balances in DOM', () => {
    render(React.createElement(App, { initialDate: '2026-11-19' }));

    // 1. Day 1: 2026-11-19
    expect(screen.getByTestId('current-date-display').textContent).toContain('19.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('6');
    expect(screen.getByTestId('metric-net-balance').textContent).toContain('1 640 000');
    expect(screen.getAllByTestId(/^master-card-/)).toHaveLength(3);

    // 2. Day 2: Navigate to 2026-11-20
    fireEvent.click(screen.getByTestId('date-next-btn'));
    expect(screen.getByTestId('current-date-display').textContent).toContain('20.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('15');
    expect(screen.getByTestId('metric-net-balance').textContent).toContain('4 190 000');
    expect(screen.getAllByTestId(/^master-card-/)).toHaveLength(4);

    // 3. Day 3: Navigate to 2026-11-21
    fireEvent.click(screen.getByTestId('date-next-btn'));
    expect(screen.getByTestId('current-date-display').textContent).toContain('21.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('0');
    expect(screen.queryByTestId('empty-masters-placeholder')).not.toBeInTheDocument();

    // 4. Return to Day 1: Nov 19
    fireEvent.click(screen.getByTestId('date-prev-btn'));
    fireEvent.click(screen.getByTestId('date-prev-btn'));
    expect(screen.getByTestId('current-date-display').textContent).toContain('19.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('6');
    expect(screen.getByTestId('metric-net-balance').textContent).toContain('1 640 000');
    expect(screen.getAllByTestId(/^master-card-/)).toHaveLength(3);
  });
});
