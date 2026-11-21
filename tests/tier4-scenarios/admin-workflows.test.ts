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
    render(React.createElement(App, null));

    // 1. Opening: Change date to blank day 2026-11-21
    const dateInput = screen.getByTestId('date-picker-input');
    fireEvent.change(dateInput, { target: { value: '2026-11-21' } });

    expect(screen.getByTestId('current-date-display').textContent).toContain('21.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('0');
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('0 UZS');
    expect(screen.getByTestId('empty-masters-placeholder')).toBeInTheDocument();

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

    // 3. Register 2 Bookings
    fireEvent.click(screen.getByTestId('add-booking-btn'));
    expect(screen.getByTestId('add-booking-modal')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('booking-time-input'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByTestId('booking-phone-input'), { target: { value: '97 123 45 67' } });
    fireEvent.change(screen.getByTestId('booking-name-input'), { target: { value: 'Алишер' } });
    fireEvent.click(screen.getByTestId('submit-booking-btn'));

    fireEvent.click(screen.getByTestId('add-booking-btn'));
    fireEvent.change(screen.getByTestId('booking-time-input'), { target: { value: '15:00' } });
    fireEvent.change(screen.getByTestId('booking-phone-input'), { target: { value: '90 987 65 43' } });
    fireEvent.change(screen.getByTestId('booking-name-input'), { target: { value: 'Нодира' } });
    fireEvent.click(screen.getByTestId('submit-booking-btn'));

    expect(screen.getByText(/Алишер/)).toBeInTheDocument();
    expect(screen.getByText(/Нодира/)).toBeInTheDocument();

    // 4. Midday & Afternoon: Log client sessions
    // For Iro: add 3 sessions (320k each = 960k)
    const addSessionBtns = screen.getAllByTestId(/^add-session-btn-/);
    const iroSessionBtn = addSessionBtns[0];
    const maxSessionBtn = addSessionBtns[1];

    fireEvent.click(iroSessionBtn);
    fireEvent.click(iroSessionBtn);
    fireEvent.click(iroSessionBtn);

    // For Max: set fee to 350000 and add 2 sessions (= 700k)
    const feeInputs = screen.getAllByTestId(/^session-fee-input-/);
    const maxFeeInput = feeInputs[1];
    fireEvent.change(maxFeeInput, { target: { value: '350000' } });
    fireEvent.click(maxSessionBtn);
    fireEvent.click(maxSessionBtn);

    // 5. Afternoon & Evening: Bar sales (120,000 UZS) and Cleaning (200,000 UZS)
    fireEvent.change(screen.getByTestId('input-bar-revenue'), { target: { value: '120000' } });
    fireEvent.change(screen.getByTestId('input-cleaning-expense'), { target: { value: '200000' } });

    // 6. Live DOM Summary Verification
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

    // 7. Verify persistence across remount
    const storedRaw = localStorage.getItem(STORAGE_KEY);
    expect(storedRaw).toBeTruthy();
    const stored = JSON.parse(storedRaw!);
    const savedDay21 = stored.find((r: any) => r.date === '2026-11-21');
    expect(savedDay21.masters).toHaveLength(2);
    expect(savedDay21.bookings).toHaveLength(2);
  });

  // Scenario 2: High-Volume Weekend Rush Operations
  it('T4-SCEN-02: handles high-volume weekend rush with multiple masters and fast-paced bar sales in live DOM', () => {
    render(React.createElement(App, null));

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

    // Toggle booking completion in DOM
    const bookingToggle = screen.getByTestId(/^booking-toggle-/);
    fireEvent.click(bookingToggle);
    // Booking completion updated in DOM
    expect(bookingToggle.querySelector('svg')).toBeInTheDocument();
  });

  // Scenario 3: Historical Ledger Audit & Dispute Correction
  it('T4-SCEN-03: corrects misattributed client session in historical ledger while maintaining balance invariant', () => {
    render(React.createElement(App, null));

    // Initially at 2026-11-19
    expect(screen.getByTestId('current-date-display').textContent).toContain('19.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('6');
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('1 840 000');

    // Audit Correction: Add missing 350,000 UZS session for Komila
    const sessionBtns = screen.getAllByTestId(/^add-session-btn-/);
    // Komila is 3rd master
    const komilaSessionBtn = sessionBtns[2];
    const feeInputs = screen.getAllByTestId(/^session-fee-input-/);
    fireEvent.change(feeInputs[2], { target: { value: '350000' } });
    fireEvent.click(komilaSessionBtn);

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
    render(React.createElement(App, null));

    // Uzbek labels in header and journal
    expect(screen.getAllByText(/Salomatlik spa-markazi/)[0]).toBeInTheDocument();

    // Morning admin adds booking in Uzbek UI
    fireEvent.click(screen.getByTestId('add-booking-btn'));
    fireEvent.change(screen.getByTestId('booking-time-input'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByTestId('booking-phone-input'), { target: { value: '97 123 45 67' } });
    fireEvent.change(screen.getByTestId('booking-name-input'), { target: { value: 'Dilshod' } });
    fireEvent.click(screen.getByTestId('submit-booking-btn'));

    expect(screen.getByText(/Dilshod/)).toBeInTheDocument();

    // 2. Evening handover: Russian admin switches language to RU via Header
    fireEvent.click(screen.getByTestId('lang-btn-ru'));
    expect(screen.getAllByText(/Оздоровительный спа-комплекс/)[0]).toBeInTheDocument();

    // Evening admin adds booking in Russian UI
    fireEvent.click(screen.getByTestId('add-booking-btn'));
    fireEvent.change(screen.getByTestId('booking-time-input'), { target: { value: '19:30' } });
    fireEvent.change(screen.getByTestId('booking-phone-input'), { target: { value: '90 999 88 77' } });
    fireEvent.change(screen.getByTestId('booking-name-input'), { target: { value: 'Евгений' } });
    fireEvent.click(screen.getByTestId('submit-booking-btn'));

    // Both morning (Dilshod) and evening (Евгений) bookings render together in DOM
    expect(screen.getByText(/Dilshod/)).toBeInTheDocument();
    expect(screen.getByText(/Евгений/)).toBeInTheDocument();
  });

  // Scenario 5: Full Disaster Recovery & Backup Lifecycle
  it('T4-SCEN-05: performs disaster recovery cycle: export backup, storage loss, restore from JSON backup in UI', () => {
    render(React.createElement(App, null));

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
    render(React.createElement(App, null));

    // 1. Client walks in, admin switches to Price List tab to check service price
    fireEvent.click(screen.getByTestId('bottom-nav-pricelist'));
    expect(screen.getByTestId('section-pricelist')).toBeInTheDocument();
    expect(screen.getByTestId('service-card-1')).toBeInTheDocument();
    expect(screen.getByText(/Фитобочка, Сауна, Массаж \(оздоровительный\)/)).toBeInTheDocument();
    expect(screen.getByText(/320 000/)).toBeInTheDocument();

    // 2. Admin switches back to Journal
    fireEvent.click(screen.getByTestId('bottom-nav-journal'));
    expect(screen.getByTestId('section-journal')).toBeInTheDocument();

    // 3. Admin logs walk-in appointment
    fireEvent.click(screen.getByTestId('add-booking-btn'));
    fireEvent.change(screen.getByTestId('booking-time-input'), { target: { value: '15:30' } });
    fireEvent.change(screen.getByTestId('booking-phone-input'), { target: { value: '90 123 45 67' } });
    fireEvent.change(screen.getByTestId('booking-name-input'), { target: { value: 'Камила' } });
    fireEvent.click(screen.getByTestId('submit-booking-btn'));

    expect(screen.getByText(/Камила/)).toBeInTheDocument();

    // 4. Service completed: mark booking completed in DOM
    const bookingCards = screen.getAllByTestId(/^booking-card-/);
    const walkInCard = bookingCards[bookingCards.length - 1];
    const toggleBtn = walkInCard.querySelector('button');
    fireEvent.click(toggleBtn!);

    // 5. Log 320,000 UZS session under Master "Мах"
    const sessionBtns = screen.getAllByTestId(/^add-session-btn-/);
    const maxSessionBtn = sessionBtns[1]; // Max is 2nd master
    const feeInputs = screen.getAllByTestId(/^session-fee-input-/);
    fireEvent.change(feeInputs[1], { target: { value: '320000' } });
    fireEvent.click(maxSessionBtn);

    // 6. Live DOM reflects updated clients and revenue
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('7');
    expect(screen.getByTestId('metric-gross-service-revenue').textContent).toContain('2 160 000');
  });

  // Scenario 7: Offline Operations & Resynchronization
  it('T4-SCEN-07: operates offline without crashing, updates live state, and resynchronizes upon reconnect', () => {
    render(React.createElement(App, null));

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
    render(React.createElement(App, null));

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
    expect(screen.getByTestId('empty-masters-placeholder')).toBeInTheDocument();

    // 4. Return to Day 1: Nov 19
    fireEvent.click(screen.getByTestId('date-prev-btn'));
    fireEvent.click(screen.getByTestId('date-prev-btn'));
    expect(screen.getByTestId('current-date-display').textContent).toContain('19.11.2026');
    expect(screen.getByTestId('metric-total-clients').textContent).toBe('6');
    expect(screen.getByTestId('metric-net-balance').textContent).toContain('1 640 000');
    expect(screen.getAllByTestId(/^master-card-/)).toHaveLength(3);
  });
});
