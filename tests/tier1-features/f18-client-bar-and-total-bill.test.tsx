import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';
import { BASELINE_NOV_19 } from '../../src/constants/baselineData';
import { STORAGE_KEY, STAFF_STORAGE_KEY, DEFAULT_STAFF } from '../../src/context/StoreContext';

describe('Feature F18: Client Bar Items & Total Bill Calculation', () => {
  beforeEach(() => {
    localStorage.clear();
    const records = [JSON.parse(JSON.stringify(BASELINE_NOV_19))];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
  });

  describe('1. Translation Keys & Mobile View Integrity', () => {
    it('renders translated selectedMaster and selectedService labels without raw keys in Russian', () => {
      render(<App initialDate="2026-11-19" />);

      // Switch to Russian
      fireEvent.click(screen.getByTestId('lang-btn-ru'));

      // Check step 3 text
      expect(screen.queryByText('pos.selectedMaster')).toBeNull();
      expect(screen.queryByText('pos.selectedService')).toBeNull();
      expect(screen.getByText(/Массажистка:/)).toBeInTheDocument();
      expect(screen.getByText(/Процедура:/)).toBeInTheDocument();
    });

    it('renders translated selectedMaster and selectedService labels without raw keys in Uzbek', () => {
      render(<App initialDate="2026-11-19" />);

      // Switch to Uzbek
      fireEvent.click(screen.getByTestId('lang-btn-uz'));

      expect(screen.queryByText('pos.selectedMaster')).toBeNull();
      expect(screen.queryByText('pos.selectedService')).toBeNull();
      expect(screen.getByText(/Massajistka:/)).toBeInTheDocument();
      expect(screen.getByText(/Xizmat:/)).toBeInTheDocument();
    });

    it('draft price container has whitespace-nowrap and single-line format to prevent vertical squeeze', () => {
      render(<App initialDate="2026-11-19" />);

      const draftPrice = screen.getByTestId('pos-draft-price');
      expect(draftPrice).toHaveClass('whitespace-nowrap');
      expect(draftPrice.textContent).toMatch(/300 000/);
    });
  });

  describe('2. Attaching Bar Items to New Orders in POS', () => {
    it('attaches bar items in Step 2/3 and calculates total client bill: Massage + Bar = Total', () => {
      render(<App initialDate="2026-11-19" />);

      // Select Masseur Iro
      const iroChip = screen.getByTestId('pos-masseur-chip-m-iro-19');
      fireEvent.click(iroChip);

      // Select Category 1 - 40 min (300 000 UZS)
      fireEvent.click(screen.getByTestId('pos-service-btn-1-40'));

      // Initially, draft price is just massage price (300 000 UZS)
      expect(screen.getByTestId('pos-draft-price')).toHaveTextContent('300 000');

      // Add Bar item: Tea (15 000 UZS)
      const teaBtn = screen.getByTestId('pos-draft-bar-btn-tea');
      fireEvent.click(teaBtn);

      // Draft price should now be 315 000 UZS (300 000 + 15 000)
      expect(screen.getByTestId('pos-draft-price')).toHaveTextContent('315 000');
      expect(screen.getByTestId('pos-draft-bar-subtotal')).toHaveTextContent('15 000');

      // Add Bar item: Water (5 000 UZS)
      const waterBtn = screen.getByTestId('pos-draft-bar-btn-water');
      fireEvent.click(waterBtn);

      // Draft price should now be 320 000 UZS (300 000 + 15 000 + 5 000)
      expect(screen.getByTestId('pos-draft-price')).toHaveTextContent('320 000');
      expect(screen.getByTestId('pos-draft-bar-subtotal')).toHaveTextContent('20 000');

      // Submit order
      fireEvent.click(screen.getByTestId('pos-submit-order'));

      // Verify success banner is shown
      expect(screen.getByTestId('pos-order-success-banner')).toBeInTheDocument();

      // Verify Day Bar Revenue increased by 20 000 UZS
      expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('20 000');
      expect(screen.getByTestId('pos-bar-current-total')).toHaveTextContent('20 000');
    });
  });

  describe('3. Shift Ledger / Client Order Card Breakdown & Total Bill', () => {
    it('displays client number, massage price, itemized bar items, and prominent total bill', () => {
      render(<App initialDate="2026-11-19" />);

      // Baseline Nov 19: Masseur Iro has ord-iro-19-1 (370 000 UZS)
      const orderCard = screen.getByTestId('client-order-card-ord-iro-19-1');
      expect(orderCard).toBeInTheDocument();

      // Shows Client #1
      const clientNum = screen.getByTestId('order-client-num-ord-iro-19-1');
      expect(clientNum).toHaveTextContent(/№1/);

      // Shows Total Bill
      const totalBill = screen.getByTestId('order-total-bill-ord-iro-19-1');
      expect(totalBill).toHaveTextContent('370 000');
    });

    it('allows adding bar item with 1-tap to existing client order and immediately updates bill', () => {
      render(<App initialDate="2026-11-19" />);

      // On Iro's first order (ord-iro-19-1), click + Bar button
      const addBarBtn = screen.getByTestId('add-bar-to-order-btn-ord-iro-19-1');
      expect(addBarBtn).toBeInTheDocument();
      fireEvent.click(addBarBtn);

      // Quick bar modal opens
      expect(screen.getByTestId('quick-add-bar-order-modal')).toBeInTheDocument();

      // Select Coffee (20 000 UZS)
      const coffeeBtn = screen.getByTestId('quick-bar-select-coffee');
      fireEvent.click(coffeeBtn);

      // Modal closes
      expect(screen.queryByTestId('quick-add-bar-order-modal')).toBeNull();

      // Total bill for client 1 should now be 370 000 + 20 000 = 390 000 UZS
      const updatedTotalBill = screen.getByTestId('order-total-bill-ord-iro-19-1');
      expect(updatedTotalBill).toHaveTextContent('390 000');

      // Daily bar revenue should now be 20 000 UZS
      expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('20 000');
      expect(screen.getByTestId('pos-bar-current-total')).toHaveTextContent('20 000');
    });
  });

  describe('4. EditOrderModal Total Bill & Bar Synchronization', () => {
    it('displays client total bill breakdown in EditOrderModal and syncs changes to shift bar total', () => {
      render(<App initialDate="2026-11-19" />);

      // Open EditOrderModal for ord-max-19-1 (300 000 UZS)
      const editBtn = screen.getByTestId('edit-order-btn-ord-max-19-1');
      fireEvent.click(editBtn);

      expect(screen.getByTestId('edit-order-modal')).toBeInTheDocument();

      // Add Tea (+20 000 UZS)
      const teaPresetBtn = screen.getByTestId('edit-order-add-bar-20000');
      fireEvent.click(teaPresetBtn);

      // Total bill in modal should be 300 000 + 20 000 = 320 000 UZS
      const modalTotalBill = screen.getByTestId('edit-order-total-bill');
      expect(modalTotalBill).toHaveTextContent('320 000');

      // Save changes
      fireEvent.click(screen.getByTestId('save-order-edit-btn'));

      // Max's order total bill should now be 320 000
      expect(screen.getByTestId('order-total-bill-ord-max-19-1')).toHaveTextContent('320 000');
      expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('20 000');
    });
  });

  describe('5. Order Removal & Updating Bar Items Invariant', () => {
    it('properly cleans up bar items from daily shift when an order is deleted', () => {
      render(<App initialDate="2026-11-19" />);

      // Select Iro and add order with Tea (15 000)
      fireEvent.click(screen.getByTestId('pos-masseur-chip-m-iro-19'));
      fireEvent.click(screen.getByTestId('pos-service-btn-1-40'));
      fireEvent.click(screen.getByTestId('pos-draft-bar-btn-tea'));
      fireEvent.click(screen.getByTestId('pos-submit-order'));

      expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('15 000');

      // Verify the order was added to Iro and find the undo button
      const undoBtns = screen.getAllByTitle(/Отменить|Bekor qilish/);
      // Click undo on the newest order
      fireEvent.click(undoBtns[0]);

      // Daily bar revenue should return to 0
      expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('0 UZS');
      expect(screen.getByTestId('pos-bar-current-total')).toHaveTextContent('0 UZS');
    });
  });

  describe('6. Zero-Priced Complimentary Massage with Bar Drinks', () => {
    it('allows entering 0 UZS for custom promo massage without defaulting to 350 000 UZS', () => {
      render(<App initialDate="2026-11-19" />);

      // Select Iro
      fireEvent.click(screen.getByTestId('pos-masseur-chip-m-iro-19'));

      // Click custom amount button
      fireEvent.click(screen.getByTestId('pos-custom-amount-btn'));

      // Enter 0 in custom amount input
      const customInput = screen.getByTestId('pos-custom-amount-input');
      fireEvent.change(customInput, { target: { value: '0' } });

      // Add Tea (15 000 UZS)
      fireEvent.click(screen.getByTestId('pos-draft-bar-btn-tea'));

      // Total bill should be 0 + 15 000 = 15 000 UZS (NOT 350 000 + 15 000 = 365 000 UZS)
      const draftPrice = screen.getByTestId('pos-draft-price');
      expect(draftPrice).toHaveTextContent('15 000');

      // Submit order
      fireEvent.click(screen.getByTestId('pos-submit-order'));
      expect(screen.getByTestId('pos-order-success-banner')).toBeInTheDocument();
      expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('15 000');
    });
  });

  describe('7. Quick Add Bar Modal Escape Dismiss and Custom Input', () => {
    it('closes quick bar modal on Escape key press and supports controlled custom input', () => {
      render(<App initialDate="2026-11-19" />);

      // Open quick bar modal on ord-iro-19-1
      fireEvent.click(screen.getByTestId('add-bar-to-order-btn-ord-iro-19-1'));
      expect(screen.getByTestId('quick-add-bar-order-modal')).toBeInTheDocument();

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape' });

      // Modal should be closed
      expect(screen.queryByTestId('quick-add-bar-order-modal')).toBeNull();
    });
  });
});
