import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';
import { BASELINE_NOV_19 } from '../../src/constants/baselineData';
import { STORAGE_KEY, STAFF_STORAGE_KEY, DEFAULT_STAFF } from '../../src/context/StoreContext';

describe('Feature F16: iOS Design System, Delete Massajistka, and Bar Editor', () => {
  beforeEach(() => {
    localStorage.clear();
    const records = [JSON.parse(JSON.stringify(BASELINE_NOV_19))];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
  });

  describe('1. Clean iOS Title & Subtitle "Касса" (Obsolete phrases removed)', () => {
    it('renders clean "Бочка Здоровья" and subtitle "Касса" in Russian', () => {
      render(<App initialDate="2026-11-19" />);

      // Primary Title
      expect(screen.getAllByText('Бочка Здоровья')[0]).toBeInTheDocument();

      // Subtitle 'Касса'
      const kassaElements = screen.getAllByText('Касса');
      expect(kassaElements.length).toBeGreaterThan(0);

      // Verifies obsolete phrases are completely absent from document
      expect(screen.queryByText(/POS Терминал заказов/i)).toBeNull();
      expect(screen.queryByText(/Admin Luxury POS Terminal/i)).toBeNull();
      expect(screen.queryByText(/Высокоскоростной терминал заказов/i)).toBeNull();
    });

    it('renders clean "Bochka Zdorovya" and subtitle "Kassa" in Uzbek', () => {
      render(<App initialDate="2026-11-19" />);

      // Switch to Uzbek
      fireEvent.click(screen.getByTestId('lang-btn-uz'));

      expect(screen.getAllByText('Bochka Zdorovya')[0]).toBeInTheDocument();
      const kassaUz = screen.getAllByText('Kassa');
      expect(kassaUz.length).toBeGreaterThan(0);

      // Obsolete phrases absent in Uzbek as well
      expect(screen.queryByText(/POS Buyurtma terminali/i)).toBeNull();
      expect(screen.queryByText(/tezkor buyurtma terminali/i)).toBeNull();
    });
  });

  describe('2. Delete Massajistka Feature', () => {
    it('renders delete button on each massajistka chip', () => {
      render(<App initialDate="2026-11-19" />);

      // Baseline Nov 19 has m-iro-19, m-max-19, m-komila-19
      expect(screen.getByTestId('delete-masseur-btn-m-iro-19')).toBeInTheDocument();
      expect(screen.getByTestId('delete-masseur-btn-m-max-19')).toBeInTheDocument();
      expect(screen.getByTestId('delete-masseur-btn-m-komila-19')).toBeInTheDocument();
    });

    it('deletes massajistka permanently when delete button is clicked and confirmed', () => {
      // Mock window.confirm to return true
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<App initialDate="2026-11-19" />);

      // Initially, Iro chip is in the document
      expect(screen.getByTestId('pos-masseur-chip-m-iro-19')).toBeInTheDocument();
      expect(screen.getByTestId('pos-active-masters-count')).toHaveTextContent('3');

      // Click delete button for Iro
      const deleteBtn = screen.getByTestId('delete-masseur-btn-m-iro-19');
      fireEvent.click(deleteBtn);

      expect(confirmSpy).toHaveBeenCalled();

      // Iro should now be removed from the shift
      expect(screen.queryByTestId('pos-masseur-chip-m-iro-19')).toBeNull();
      expect(screen.getByTestId('pos-active-masters-count')).toHaveTextContent('2');

      confirmSpy.mockRestore();
    });

    it('does not delete massajistka when user cancels confirmation', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<App initialDate="2026-11-19" />);

      expect(screen.getByTestId('pos-masseur-chip-m-iro-19')).toBeInTheDocument();

      const deleteBtn = screen.getByTestId('delete-masseur-btn-m-iro-19');
      fireEvent.click(deleteBtn);

      expect(confirmSpy).toHaveBeenCalled();

      // Iro should still be present
      expect(screen.getByTestId('pos-masseur-chip-m-iro-19')).toBeInTheDocument();

      confirmSpy.mockRestore();
    });
  });

  describe('3. Bar Editing & Modification Feature', () => {
    it('opens Bar Editor Modal when clicking edit button in Quick Bar card', () => {
      render(<App initialDate="2026-11-19" />);

      const openBarBtn = screen.getByTestId('open-bar-editor-btn');
      fireEvent.click(openBarBtn);

      expect(screen.getByTestId('bar-editor-modal')).toBeInTheDocument();
      expect(screen.getByText('Управление баром')).toBeInTheDocument();
    });

    it('allows admin to edit total daily bar revenue directly and updates calculations', () => {
      render(<App initialDate="2026-11-19" />);

      // Open Bar Editor Modal
      fireEvent.click(screen.getByTestId('open-bar-editor-btn'));

      // Direct revenue input
      const totalInput = screen.getByTestId('bar-total-revenue-input');
      fireEvent.change(totalInput, { target: { value: '600000' } });

      // Save total
      const saveBtn = screen.getByTestId('bar-editor-save-total-btn');
      fireEvent.click(saveBtn);

      // Close modal
      fireEvent.click(screen.getByTestId('close-bar-editor-btn'));

      // Verify updated total in Quick Bar card & Daily Breakdown metric
      expect(screen.getByTestId('pos-bar-current-total')).toHaveTextContent('600 000');
      expect(screen.getByTestId('metric-bar-revenue')).toHaveTextContent('600 000');
    });

    it('allows adding custom bar item with custom name and price', () => {
      render(<App initialDate="2026-11-19" />);

      fireEvent.click(screen.getByTestId('open-bar-editor-btn'));

      // Fill in new item inputs
      const nameInput = screen.getByTestId('new-bar-item-name');
      const priceInput = screen.getByTestId('new-bar-item-price');
      const addBtn = screen.getByTestId('add-bar-custom-item-btn');

      fireEvent.change(nameInput, { target: { value: 'Лимонад фреш' } });
      fireEvent.change(priceInput, { target: { value: '45000' } });
      fireEvent.click(addBtn);

      // Verify item appears in the list
      expect(screen.getByText('Лимонад фреш')).toBeInTheDocument();
      expect(screen.getByTestId('bar-item-price-0')).toHaveTextContent('45 000');

      // Close modal
      fireEvent.click(screen.getByTestId('bar-editor-done-btn'));
      expect(screen.queryByTestId('bar-editor-modal')).toBeNull();
    });

    it('allows editing an existing bar item in the list', () => {
      render(<App initialDate="2026-11-19" />);

      // First add an item via quick bar
      fireEvent.click(screen.getByTestId('pos-quick-bar-btn-20000'));

      // Open Bar Editor
      fireEvent.click(screen.getByTestId('open-bar-editor-btn'));

      // There should be 1 item row
      expect(screen.getByTestId('bar-item-row-0')).toBeInTheDocument();

      // Click edit
      fireEvent.click(screen.getByTestId('edit-bar-item-0'));

      // Change name and price
      const editNameInput = screen.getByTestId('edit-bar-item-name-0');
      const editPriceInput = screen.getByTestId('edit-bar-item-price-0');
      fireEvent.change(editNameInput, { target: { value: 'Чай с мятой' } });
      fireEvent.change(editPriceInput, { target: { value: '25000' } });

      // Save edit
      fireEvent.click(screen.getByTestId('save-bar-item-0'));

      expect(screen.getByText('Чай с мятой')).toBeInTheDocument();
      expect(screen.getByTestId('bar-item-price-0')).toHaveTextContent('25 000');
    });

    it('allows deleting an individual bar item from the list', () => {
      render(<App initialDate="2026-11-19" />);

      // Add 2 items via quick preset
      fireEvent.click(screen.getByTestId('pos-quick-bar-btn-10000'));
      fireEvent.click(screen.getByTestId('pos-quick-bar-btn-30000'));

      // Open Bar Editor
      fireEvent.click(screen.getByTestId('open-bar-editor-btn'));

      expect(screen.getByTestId('bar-item-row-0')).toBeInTheDocument();
      expect(screen.getByTestId('bar-item-row-1')).toBeInTheDocument();

      // Delete first item
      fireEvent.click(screen.getByTestId('delete-bar-item-0'));

      // Only 1 item remains
      expect(screen.queryByTestId('bar-item-row-1')).toBeNull();
      expect(screen.getByTestId('bar-item-row-0')).toBeInTheDocument();
    });
  });
});
