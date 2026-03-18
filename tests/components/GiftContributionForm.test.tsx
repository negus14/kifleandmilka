import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GiftContributionForm from '@/components/GiftContributionForm';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const defaultProps = {
  slug: "test-wedding",
  giftItems: [],
  currency: "GBP",
  paymentOptions: [],
};

describe('GiftContributionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders the form with default currency symbol', () => {
    render(<GiftContributionForm {...defaultProps} />);
    expect(screen.getByText('£')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('does not show currency selector with single currency payment options', () => {
    render(<GiftContributionForm {...defaultProps} paymentOptions={[
      { label: "PayPal", url: "https://paypal.me/test", currencies: ["GBP"] },
    ]} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('derives currencies from payment options and shows selector', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "PayPal", url: "https://paypal.me/test", currencies: ["GBP", "USD"] },
          { label: "Wise", url: "https://wise.com/pay", currencies: ["EUR", "GBP"] },
        ]}
      />
    );
    // Currency selector is now a <select> dropdown
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    const options = select.querySelectorAll('option');
    const optionTexts = Array.from(options).map(o => o.textContent);
    expect(optionTexts).toContain('£ GBP');
    expect(optionTexts).toContain('$ USD');
    expect(optionTexts).toContain('€ EUR');
  });

  it('filters payment methods by selected currency', async () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "PayPal", url: "https://paypal.me/gbp", currencies: ["GBP", "USD"] },
          { label: "Monzo", url: "https://monzo.me/test", currencies: ["GBP"] },
          { label: "Wise", url: "https://wise.com/eur", currencies: ["EUR"] },
        ]}
      />
    );

    // Default is GBP — PayPal and Monzo accept GBP (multiple methods shown in grid)
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    expect(screen.getByText('Monzo')).toBeInTheDocument();
    expect(screen.queryByText('Wise')).not.toBeInTheDocument();

    // Switch to USD — only PayPal accepts USD (Auto-selected, grid hidden)
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'USD' } });
    expect(screen.queryByText('PayPal')).not.toBeInTheDocument();
    expect(screen.queryByText('Monzo')).not.toBeInTheDocument();
    expect(screen.queryByText('Wise')).not.toBeInTheDocument();
    expect(screen.getByText('Send & Continue')).toBeInTheDocument();

    // Switch to EUR — only Wise accepts EUR (Auto-selected, grid hidden)
    fireEvent.change(select, { target: { value: 'EUR' } });
    expect(screen.queryByText('Wise')).not.toBeInTheDocument();
    expect(screen.queryByText('PayPal')).not.toBeInTheDocument();
    expect(screen.queryByText('Monzo')).not.toBeInTheDocument();
    expect(screen.getByText('Send & Continue')).toBeInTheDocument();
  });

  it('resets payment method when switching currency', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "PayPal", currencies: ["GBP"] },
          { label: "Wise", currencies: ["USD"] },
          { label: "Bank Transfer", currencies: ["GBP", "USD"] },
        ]}
      />
    );

    // Multiple methods for GBP: PayPal, Bank Transfer
    fireEvent.click(screen.getByText('PayPal'));
    expect(screen.getByText('PayPal').className).toContain('active');

    // Switch currency to USD — payment method should reset (PayPal no longer available)
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'USD' } });
    expect(screen.queryByText('PayPal')).not.toBeInTheDocument();

    // Multiple methods for USD: Wise, Bank Transfer. None should be active initially.
    expect(screen.getByText('Wise').className).not.toContain('active');
    expect(screen.getByText('Bank Transfer').className).not.toContain('active');
  });

  it('shows payment options without currencies for all currencies (backwards compat)', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "PayPal", url: "https://paypal.me/gbp", currencies: ["GBP"] },
          { label: "Wise", url: "https://wise.com/usd", currencies: ["USD"] },
          { label: "Legacy Link", url: "https://old.com" }, // no currencies
        ]}
      />
    );

    // Legacy link should show for GBP (default)
    expect(screen.getByText('Legacy Link')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();

    // Switch to USD — legacy link should still show
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'USD' } });
    expect(screen.getByText('Legacy Link')).toBeInTheDocument();
    expect(screen.getByText('Wise')).toBeInTheDocument();
  });

  it('deduplicates currencies across multiple payment options', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "PayPal", currencies: ["GBP", "USD"] },
          { label: "Revolut", currencies: ["GBP", "EUR", "USD"] },
        ]}
      />
    );
    // Currency selector is now a <select> dropdown with <option> elements
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    // Should have 3 unique currency options
    expect(options).toHaveLength(3);
  });

  it('displays correct symbols for various currencies', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "ETB Pay", currencies: ["ETB"] },
          { label: "NGN Pay", currencies: ["NGN"] },
          { label: "INR Pay", currencies: ["INR"] },
        ]}
      />
    );
    expect(screen.getByText('Br ETB')).toBeInTheDocument();
    expect(screen.getByText('₦ NGN')).toBeInTheDocument();
    expect(screen.getByText('₹ INR')).toBeInTheDocument();
  });

  it('falls back to site default currency when no payment options have currencies', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        currency="ETB"
        paymentOptions={[
          { label: "PayPal", url: "https://paypal.me/test" }, // no currencies
        ]}
      />
    );
    // Label is just "Amount", currency symbol shown separately
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Br')).toBeInTheDocument();
    // No currency dropdown when only one effective currency
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('submits the selected currency with the form', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <GiftContributionForm
        {...defaultProps}
        showName={true}
        paymentOptions={[
          { label: "PayPal (GBP)", currencies: ["GBP"] },
          { label: "PayPal (ETB)", currencies: ["ETB"] },
        ]}
      />
    );

    // Switch currency to ETB using the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ETB' } });

    await userEvent.type(screen.getByPlaceholderText('Your full name'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('0'), '100');

    // Auto-selected PayPal (ETB), so button says "Send & Continue"
    fireEvent.click(screen.getByText('Send & Continue'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/gift-contribution', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"currency":"ETB"'),
      }));
    });
  });

  it('shows gift items grid when items are provided', () => {
    const items = [
      { id: '1', name: 'Honeymoon Fund', description: 'Help us travel', suggestedAmount: '50' },
      { id: '2', name: 'Kitchen Set', description: '', suggestedAmount: '100' },
    ];
    render(
      <GiftContributionForm
        {...defaultProps}
        giftItems={items}
        currency="ETB"
      />
    );
    expect(screen.getByText('Honeymoon Fund')).toBeInTheDocument();
    expect(screen.getByText('Br50')).toBeInTheDocument();
    expect(screen.getByText('Br100')).toBeInTheDocument();
  });

  it('auto-selects payment method if only one option exists', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "PayPal", currencies: ["GBP"] },
        ]}
      />
    );
    // Button should not be rendered if only one (my code hides the selection grid if length <= 1)
    expect(screen.queryByText('PayPal')).not.toBeInTheDocument();
    // But it should be selected internally so the submit button says "Send & Continue"
    expect(screen.getByText('Send & Continue')).toBeInTheDocument();
  });

  it('shows bank details when a bank method is selected', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        bankDetails={[
          { label: "Bank Transfer", currencies: ["GBP"], bankName: "Test Bank", accountNumber: "123456" }
        ]}
        paymentOptions={[
           { label: "PayPal", currencies: ["GBP"] }
        ]}
      />
    );

    // Grid should show both
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();

    // Click bank transfer
    fireEvent.click(screen.getByText('Bank Transfer'));

    // Should show bank details
    expect(screen.getByText('Test Bank')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
  });

  it('copies all bank details when "Copy All" is clicked', async () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        bankDetails={[
          { label: "Bank Transfer", currencies: ["GBP"], bankName: "Test Bank", accountNumber: "123456" }
        ]}
      />
    );

    fireEvent.click(screen.getByText('Copy All'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Bank: Test Bank'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Account Number: 123456'));
    expect(screen.getByText('Copied All!')).toBeInTheDocument();
  });

  it('shows "Send Well Wishes" for bank transfer and submits immediately', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <GiftContributionForm
        {...defaultProps}
        bankDetails={[
          { label: "Bank Transfer", currencies: ["GBP"], bankName: "Test Bank", accountNumber: "123456" }
        ]}
      />
    );

    expect(screen.getByText('Send Well Wishes')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('0'), '50');
    fireEvent.click(screen.getByText('Send Well Wishes'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(screen.getByText('Thank You!')).toBeInTheDocument();
    });
  });
});
