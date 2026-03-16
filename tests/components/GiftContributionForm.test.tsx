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
  });

  it('renders the form with default currency symbol', () => {
    render(<GiftContributionForm {...defaultProps} />);
    expect(screen.getByText('£')).toBeInTheDocument();
    expect(screen.getByText(/Amount \(GBP\)/)).toBeInTheDocument();
  });

  it('does not show currency selector with single currency payment options', () => {
    render(<GiftContributionForm {...defaultProps} paymentOptions={[
      { label: "PayPal", url: "https://paypal.me/test", currencies: ["GBP"] },
    ]} />);
    expect(screen.queryByText('Select Currency')).not.toBeInTheDocument();
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
    expect(screen.getByText('Select Currency')).toBeInTheDocument();
    expect(screen.getByText('£ GBP')).toBeInTheDocument();
    expect(screen.getByText('$ USD')).toBeInTheDocument();
    expect(screen.getByText('€ EUR')).toBeInTheDocument();
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

    // Default is GBP — PayPal and Monzo accept GBP
    const select = screen.getByRole('combobox');
    let options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
    expect(options).toContain("PayPal");
    expect(options).toContain("Monzo");
    expect(options).not.toContain("Wise");

    // Switch to USD — only PayPal accepts USD
    fireEvent.click(screen.getByText('$ USD'));
    options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
    expect(options).toContain("PayPal");
    expect(options).not.toContain("Monzo");
    expect(options).not.toContain("Wise");

    // Switch to EUR — only Wise accepts EUR
    fireEvent.click(screen.getByText('€ EUR'));
    options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
    expect(options).toContain("Wise");
    expect(options).not.toContain("PayPal");
    expect(options).not.toContain("Monzo");
  });

  it('resets payment method when switching currency', () => {
    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "PayPal", currencies: ["GBP"] },
          { label: "Wise", currencies: ["USD"] },
        ]}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "PayPal" } });
    expect(select.value).toBe("PayPal");

    // Switch currency — payment method should reset
    fireEvent.click(screen.getByText('$ USD'));
    expect(select.value).toBe("");
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
    const select = screen.getByRole('combobox');
    let options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
    expect(options).toContain("Legacy Link");
    expect(options).toContain("PayPal");

    // Switch to USD — legacy link should still show
    fireEvent.click(screen.getByText('$ USD'));
    options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
    expect(options).toContain("Legacy Link");
    expect(options).toContain("Wise");
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
    // Should have 3 unique currencies, not 5
    const buttons = screen.getAllByRole('button').filter(b => b.className.includes('gift-contrib__currency-btn'));
    expect(buttons).toHaveLength(3);
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
    expect(screen.getByText(/Amount \(ETB\)/)).toBeInTheDocument();
    expect(screen.queryByText('Select Currency')).not.toBeInTheDocument();
  });

  it('submits the selected currency with the form', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <GiftContributionForm
        {...defaultProps}
        paymentOptions={[
          { label: "PayPal (GBP)", currencies: ["GBP"] },
          { label: "PayPal (ETB)", currencies: ["ETB"] },
        ]}
      />
    );

    fireEvent.click(screen.getByText('Br ETB'));

    await userEvent.type(screen.getByPlaceholderText('Your full name'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('0'), '100');

    fireEvent.click(screen.getByText('Send Well Wishes'));

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
});
