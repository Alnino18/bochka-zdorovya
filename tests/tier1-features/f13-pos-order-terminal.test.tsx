import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '../../src/App';
import { STORAGE_KEY } from '../../src/context/StoreContext';
import { BASELINE_NOV_19 } from '../../src/constants/baselineData';
import { groupMasseurOrders } from '../../src/utils/calculations';
import { MasterEntry } from '../../src/types/accounting';

describe('Feature F13: High-Speed Admin POS Order Terminal', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([BASELINE_NOV_19]));
  });

  it('T1-F13-01: renders Admin POS Order Terminal shell without customer-facing clutter', () => {
    render(<App />);

    // Verifies POS Terminal is active on the journal tab
    expect(screen.getByTestId('pos-order-terminal')).toBeInTheDocument();

    // Verifies customer-facing phone dialers, instagram links, and phone booking calendar are removed
    expect(screen.queryByTestId('header-phone-link')).toBeNull();
    expect(screen.queryByTestId('header-instagram-link')).toBeNull();
    expect(screen.queryByTestId('contact-card-actions')).toBeNull();
    expect(screen.queryByTestId('bookings-section')).toBeNull();
    expect(screen.queryByTestId('add-booking-btn')).toBeNull();
  });

  it('T1-F13-02: allows selecting masseur via quick chips (Step 1)', () => {
    render(<App />);

    // Check chips exist for baseline Nov 19 masseurs (Иро, Мах, Комила)
    const iroChip = screen.getByTestId('pos-masseur-chip-m-iro-19');
    const maxChip = screen.getByTestId('pos-masseur-chip-m-max-19');
    const komilaChip = screen.getByTestId('pos-masseur-chip-m-komila-19');

    expect(iroChip).toBeInTheDocument();
    expect(maxChip).toBeInTheDocument();
    expect(komilaChip).toBeInTheDocument();

    // Select Max
    fireEvent.click(maxChip);
    expect(maxChip).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('pos-draft-master-name')).toHaveTextContent('Мах');

    // Select Komila
    fireEvent.click(komilaChip);
    expect(komilaChip).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('pos-draft-master-name')).toHaveTextContent('Комила');
  });

  it('T1-F13-03: renders menu cards for all 8 official categories and allows selecting services (Step 2)', () => {
    render(<App />);

    // Verify all 8 categories exist
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByTestId(`pos-service-category-${i}`)).toBeInTheDocument();
    }

    // Select Category 1 - 40 min (300 000 UZS)
    const cat1Opt40 = screen.getByTestId('pos-service-btn-1-40');
    fireEvent.click(cat1Opt40);
    expect(screen.getByTestId('pos-draft-price')).toHaveTextContent('300 000');

    // Select Category 2 - 60 min (400 000 UZS)
    const cat2Opt60 = screen.getByTestId('pos-service-btn-2-60');
    fireEvent.click(cat2Opt60);
    expect(screen.getByTestId('pos-draft-price')).toHaveTextContent('400 000');
  });

  it('T1-F13-04: executes instant order logging (Step 3: Qabul qilish) and updates masseur shift', () => {
    render(<App />);

    // Select Masseur: Iro (starts with 2 clients in baseline Nov 19)
    const iroChip = screen.getByTestId('pos-masseur-chip-m-iro-19');
    fireEvent.click(iroChip);

    // Initial clients
    const iroCard = screen.getByTestId('master-card-m-iro-19');
    expect(within(iroCard).getByTestId('master-clients-m-iro-19')).toHaveTextContent('2');

    // Select Service: Cat 1 (40 min - 300 000 UZS)
    fireEvent.click(screen.getByTestId('pos-service-btn-1-40'));

    // Tap 'Add Order / Qabul qilish'
    const submitBtn = screen.getByTestId('pos-submit-order');
    fireEvent.click(submitBtn);

    // Verify client count incremented from 2 to 3
    expect(within(iroCard).getByTestId('master-clients-m-iro-19')).toHaveTextContent('3');

    // Verify revenue updated (470 000 + 300 000 = 770 000 UZS)
    expect(within(iroCard).getByTestId('master-revenue-m-iro-19')).toHaveTextContent('770 000');

    // Verify payout updated (200 000 + 100 000 = 300 000 UZS)
    expect(within(iroCard).getByTestId('master-payout-m-iro-19')).toHaveTextContent('300 000');

    // Verify salon share updated (770 000 - 300 000 = 470 000 UZS)
    expect(within(iroCard).getByTestId('master-salon-share-m-iro-19')).toHaveTextContent('470 000');

    // Success banner feedback should be visible
    expect(screen.getByTestId('pos-order-success-banner')).toBeInTheDocument();
  });

  it('T1-F13-05: verifies live itemized breakdown of massages performed per masseur', () => {
    const testMaster: MasterEntry = {
      id: 'm-test',
      name: 'Комила',
      nameUz: 'Komila',
      clientCount: 3,
      revenue: 1040000,
      payout: 300000,
      salonShare: 740000,
      orders: [
        {
          id: 'ord-1',
          serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)',
          durationMinutes: 40,
          price: 300000,
        },
        {
          id: 'ord-2',
          serviceName: 'Фитобочка, Сауна, Массаж (оздоровительный)',
          durationMinutes: 40,
          price: 300000,
        },
        {
          id: 'ord-3',
          serviceName: 'Фитобочка, Сауна, Массаж (медовый)',
          durationMinutes: 60,
          price: 400000,
        },
      ],
    };

    const grouped = groupMasseurOrders(testMaster, 'ru');
    expect(grouped).toHaveLength(2);

    // 2x Оздоровительный (40 мин)
    const ozd = grouped.find((g) => g.serviceName.includes('оздоровительный'));
    expect(ozd).toBeDefined();
    expect(ozd?.count).toBe(2);
    expect(ozd?.totalPrice).toBe(600000);

    // 1x Медовый (60 мин)
    const med = grouped.find((g) => g.serviceName.includes('медовый'));
    expect(med).toBeDefined();
    expect(med?.count).toBe(1);
    expect(med?.totalPrice).toBe(400000);
  });

  it('T1-F13-06: allows logging quick bar sales and cleaning expenses', () => {
    render(<App />);

    // Quick bar preset: e.g. + Choy 20k
    const barBtn = screen.getByTestId('pos-quick-bar-btn-20000');
    fireEvent.click(barBtn);

    expect(screen.getByTestId('pos-bar-current-total')).toHaveTextContent('20 000');
    expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('20 000');

    // Quick cleaning preset: 150k
    const cleanBtn = screen.getByTestId('pos-quick-cleaning-preset-150000');
    fireEvent.click(cleanBtn);

    expect(screen.getByTestId('pos-cleaning-current-total')).toHaveTextContent('150 000');
    expect(screen.getByTestId('metric-cleaning-expenses')).toHaveTextContent('150 000');
  });

  it('T1-F13-07: verifies salon net summary metrics match cashier ledger calculations', () => {
    render(<App />);

    // For baseline Nov 19:
    // Total clients = 6
    // Service revenue = 1 840 000
    // Bar = 0
    // Cleaning = 200 000
    // Master payouts = 600 000
    // Cash in register (Net balance) = 1 840 000 - 200 000 = 1 640 000
    // Net Salon profit = 1 640 000 - 600 000 = 1 040 000
    expect(screen.getByTestId('metric-total-clients')).toHaveTextContent('6');
    expect(screen.getByTestId('metric-gross-service-revenue')).toHaveTextContent('1 840 000');
    expect(screen.getByTestId('metric-master-payouts')).toHaveTextContent('600 000');
    expect(screen.getByTestId('metric-cleaning-expenses')).toHaveTextContent('200 000');
    expect(screen.getByTestId('metric-net-balance')).toHaveTextContent('1 640 000');
    expect(screen.getByTestId('metric-net-profit')).toHaveTextContent('1 040 000');
  });

  it('T1-F13-08: supports custom amount order logging', () => {
    render(<App />);

    // Select Masseur Komila
    fireEvent.click(screen.getByTestId('pos-masseur-chip-m-komila-19'));

    // Click Custom Amount button
    fireEvent.click(screen.getByTestId('pos-custom-amount-btn'));

    // Enter 250000 in custom amount input
    const customInput = screen.getByTestId('pos-custom-amount-input');
    fireEvent.change(customInput, { target: { value: '250000' } });

    expect(screen.getByTestId('pos-draft-price')).toHaveTextContent('250 000');

    // Submit order
    fireEvent.click(screen.getByTestId('pos-submit-order'));

    // Komila should now have 2 clients (1 initial + 1 custom)
    const komilaCard = screen.getByTestId('master-card-m-komila-19');
    expect(within(komilaCard).getByTestId('master-clients-m-komila-19')).toHaveTextContent('2');
    expect(within(komilaCard).getByTestId('master-revenue-m-komila-19')).toHaveTextContent('600 000'); // 350k + 250k
  });

  it('T1-F13-09: verifies bilingual UZ/RU switching on the POS terminal', () => {
    render(<App />);

    // Switch to Uzbek
    const uzBtn = screen.getByTestId('lang-btn-uz');
    fireEvent.click(uzBtn);

    // Uzbek step titles and buttons
    expect(screen.getByText('1. Ustanı tanlang')).toBeInTheDocument();
    expect(screen.getByText('2. Xizmatni tanlang')).toBeInTheDocument();
    expect(screen.getByText('3. Buyurtmani tasdiqlash:')).toBeInTheDocument();

    // Switch back to Russian
    const ruBtn = screen.getByTestId('lang-btn-ru');
    fireEvent.click(ruBtn);

    expect(screen.getByText('1. Выберите мастера')).toBeInTheDocument();
    expect(screen.getByText('2. Выберите услугу')).toBeInTheDocument();
  });
});
